import express from "express";
import { createServer } from "http";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { handleAiGenerateRoute } from "./ai-tools";
import {
  registerConvertRoutes,
  type ConvertRequestHandler,
} from "./register-tool-routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const canonicalHost = "toolsylab.xyz";
  const redirectHosts = new Set([
    "www.toolsylab.xyz",
  ]);

  app.use(express.json({ limit: "1mb" }));

  app.use((req, res, next) => {
    const hostHeader = req.headers.host;
    const host = hostHeader?.split(":")[0];

    if (host && redirectHosts.has(host)) {
      res.redirect(308, `https://${canonicalHost}${req.originalUrl}`);
      return;
    }

    next();
  });

  const registerPost = (route: string, handler: ConvertRequestHandler) => {
    app.post(route, (req, res) => {
      void handler(req, res).catch(error => {
        console.error(`${route} failed:`, error);

        if (!res.headersSent) {
          res.status(500).json({ error: "Conversion failed." });
          return;
        }

        res.destroy(error as Error);
      });
    });
  };

  registerConvertRoutes(registerPost);
  app.all("/api/ai/generate", (req, res, next) => {
    if (req.method === "POST") {
      next();
      return;
    }

    res.status(405).json({ error: "Use POST /api/ai/generate." });
  });
  app.post("/api/ai/generate", handleAiGenerateRoute);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (req, res) => {
    if (!path.extname(req.path) && req.path !== "/") {
      const routeHtmlPath = path.resolve(
        staticPath,
        `${req.path.slice(1)}.html`
      );

      if (
        routeHtmlPath.startsWith(`${staticPath}${path.sep}`) &&
        existsSync(routeHtmlPath)
      ) {
        res.sendFile(routeHtmlPath);
        return;
      }
    }

    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

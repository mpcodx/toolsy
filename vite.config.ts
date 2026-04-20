import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin, type PreviewServer, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { generateAiPayload } from "./server/ai-tools";
import { registerConvertRoutes, type ConvertRequestHandler } from "./server/register-tool-routes";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".tooly-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

function handleApiError(route: string, res: ServerResponse, error: unknown) {
  console.error(`${route} failed:`, error);

  if (!res.headersSent) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Conversion failed." }));
    return;
  }

  res.destroy(error as Error);
}

function registerApiMiddleware(
  server: ViteDevServer | PreviewServer,
  route: string,
  handler: ConvertRequestHandler
) {
  server.middlewares.use(route, (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.method !== "POST") {
      next();
      return;
    }

    void handler(req, res).catch((error) => handleApiError(route, res, error));
  });
}

function readJsonRequestBody(req: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function registerAiGenerateMiddleware(server: ViteDevServer | PreviewServer) {
  server.middlewares.use("/api/ai/generate", (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Use POST /api/ai/generate." }));
      return;
    }

    void (async () => {
      try {
        const body = await readJsonRequestBody(req);
        const { status, payload } = await generateAiPayload(body);

        res.statusCode = status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(payload));
      } catch (error) {
        const isInvalidJson =
          error instanceof SyntaxError &&
          /JSON|Unexpected token|Unexpected end of JSON input/i.test(error.message);

        res.statusCode = isInvalidJson ? 400 : 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(
          JSON.stringify({
            error: isInvalidJson
              ? "Invalid JSON request body."
              : "Unable to generate content right now.",
          })
        );
      }
    })();
  });
}

function registerApiRoutes(server: ViteDevServer | PreviewServer) {
  registerConvertRoutes((route, handler) => registerApiMiddleware(server, route, handler));
  registerAiGenerateMiddleware(server);
}

function inlineEntrypointCss(): Plugin {
  return {
    name: "inline-entrypoint-css",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const htmlAsset = Object.values(bundle).find(
        (item): item is import("rollup").OutputAsset =>
          item.type === "asset" && item.fileName.endsWith(".html")
      );

      if (!htmlAsset || typeof htmlAsset.source !== "string") {
        return;
      }

      const stylesheetMatch = htmlAsset.source.match(
        /<link rel="stylesheet"[^>]+href="\/([^"]+\.css)"[^>]*>/
      );

      if (!stylesheetMatch) {
        return;
      }

      const cssFileName = stylesheetMatch[1];
      const cssAsset = bundle[cssFileName];

      if (!cssAsset || cssAsset.type !== "asset" || typeof cssAsset.source !== "string") {
        return;
      }

      const styleTag = `<style data-inline-entry-css>${cssAsset.source}</style>`;

      htmlAsset.source = htmlAsset.source
        .replace(stylesheetMatch[0], "")
        .replace('<script type="module"', `${styleTag}\n    <script type="module"`);

      delete bundle[cssFileName];
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const includeManusRuntime = command === "serve" && mode !== "production";
  const plugins: Plugin[] = [
    react(),
    tailwindcss(),
    ...(includeManusRuntime ? [vitePluginManusRuntime()] : []),
    vitePluginManusDebugCollector(),
    inlineEntrypointCss(),
    {
      name: "register-api-routes",
      configureServer(server) {
        registerApiRoutes(server);
      },
      configurePreviewServer(server) {
        registerApiRoutes(server);
      },
    },
  ];

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      strictPort: false, // Will find next available port if 3000 is busy
      host: true,
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "localhost",
        "127.0.0.1",
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});

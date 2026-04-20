import { generateAiPayload } from "../../shared/ai-tools-core";

export const config = {
  runtime: "nodejs",
};

type VercelRequestLike = {
  body?: unknown;
  method?: string;
};

type VercelResponseLike = {
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => VercelResponseLike;
};

function normalizeBody(body: unknown) {
  if (typeof body !== "string") {
    return body;
  }

  if (!body.trim()) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({ error: "Use POST /api/ai/generate." });
      return;
    }

    const { status, payload } = await generateAiPayload(normalizeBody(req.body));
    res.status(status).json(payload);
  } catch (error) {
    console.error("/api/ai/generate Vercel handler failed:", error);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Unable to generate content right now."
          : error instanceof Error
            ? error.message
            : "Unknown server error.",
    });
  }
}

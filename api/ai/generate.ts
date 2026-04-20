import { generateAiPayload } from "../../shared/ai-tools-core";

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
    throw new SyntaxError("Invalid JSON request body.");
  }
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({ error: "Use POST /api/ai/generate." });
      return;
    }

    const body = normalizeBody(req.body);
    const { status, payload } = await generateAiPayload(body);
    res.status(status).json(payload);
  } catch (error) {
    console.error("/api/ai/generate Vercel handler failed:", error);

    const isInvalidJson =
      error instanceof SyntaxError &&
      /JSON|Unexpected token|Unexpected end of JSON input|Invalid JSON request body/i.test(
        error.message
      );

    res.status(isInvalidJson ? 400 : 500).json({
      error: isInvalidJson
        ? "Invalid JSON request body."
        : "Unable to generate content right now.",
    });
  }
}

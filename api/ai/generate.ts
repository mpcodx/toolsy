import { generateAiPayload } from "../../server/ai-tools";

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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Use POST /api/ai/generate." });
    return;
  }

  const { status, payload } = await generateAiPayload(normalizeBody(req.body));
  res.status(status).json(payload);
}

import { generateAiPayload } from "../../shared/ai-tools-core";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

async function parseRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new SyntaxError("Invalid JSON request body.");
  }
}

export function GET() {
  return new Response(JSON.stringify({ error: "Use POST /api/ai/generate." }), {
    status: 405,
    headers: {
      ...JSON_HEADERS,
      Allow: "POST",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestBody(request);
    const { status, payload } = await generateAiPayload(body);

    return new Response(JSON.stringify(payload), {
      status,
      headers: JSON_HEADERS,
    });
  } catch (error) {
    console.error("/api/ai/generate Vercel handler failed:", error);

    const isInvalidJson =
      error instanceof SyntaxError &&
      /JSON|Unexpected token|Unexpected end of JSON input|Invalid JSON request body/i.test(
        error.message
      );

    return new Response(
      JSON.stringify({
        error: isInvalidJson
          ? "Invalid JSON request body."
          : "Unable to generate content right now.",
      }),
      {
        status: isInvalidJson ? 400 : 500,
        headers: JSON_HEADERS,
      }
    );
  }
}

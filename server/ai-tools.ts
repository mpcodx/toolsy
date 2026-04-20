import type { Request, Response } from "express";
import { generateAiPayload } from "../shared/ai-tools-core";

export async function handleAiGenerateRoute(req: Request, res: Response) {
  const { status, payload } = await generateAiPayload(req.body);
  res.status(status).json(payload);
}

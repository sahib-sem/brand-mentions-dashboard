import type { z } from "zod";
import { mentionsResponseSchema, trendsResponseSchema } from "./schemas";
import type { MentionsRequest, TrendsRequest } from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function post<TSchema extends z.ZodType>(path: string, body: unknown, schema: TSchema): Promise<z.infer<TSchema>> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return schema.parse(await response.json());
}

export const getMentions = (request: MentionsRequest) => post("/mentions", request, mentionsResponseSchema);
export const getTrends = (request: TrendsRequest) => post("/mentions/trends", request, trendsResponseSchema);

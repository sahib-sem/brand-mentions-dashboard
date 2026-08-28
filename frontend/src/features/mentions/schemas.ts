import { z } from "zod";

const mentionSchema = z.object({
  id: z.string(),
  query_text: z.string(),
  model: z.string(),
  mentioned: z.boolean(),
  position: z.number().int().nullable(),
  sentiment: z.string().nullable(),
  citation_url: z.string().nullable(),
  created_at: z.string(),
});

export const mentionsResponseSchema = z.object({
  data: z.array(mentionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
});

export const trendsResponseSchema = z.object({
  data: z.array(z.object({
    date: z.string(),
    total: z.number().int().nonnegative(),
    mentioned: z.number().int().nonnegative(),
  })),
});

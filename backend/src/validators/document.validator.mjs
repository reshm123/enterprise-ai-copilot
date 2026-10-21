import { z } from "zod";

export const documentMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(255),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),
});
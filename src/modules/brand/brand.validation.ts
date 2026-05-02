import { z } from "zod";

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    logo: z.string().optional(),
    website: z.string().url("Invalid URL").optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    logo: z.string().optional(),
    website: z.string().url("Invalid URL").optional(),
    isActive: z.boolean().optional(),
  }),
});
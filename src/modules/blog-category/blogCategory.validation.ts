import { z } from "zod";

export const createBlogCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateBlogCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
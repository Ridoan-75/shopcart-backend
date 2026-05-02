import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().optional().default(0),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
  }),
});
import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    rating: z.number().int().min(1, "Min rating is 1").max(5, "Max rating is 5"),
    title: z.string().optional(),
    body: z.string().min(10, "Review must be at least 10 characters"),
    images: z.array(z.string()).optional().default([]),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().optional(),
    body: z.string().min(10).optional(),
    images: z.array(z.string()).optional(),
  }),
});
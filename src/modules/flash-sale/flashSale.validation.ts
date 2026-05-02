import { z } from "zod";

export const createFlashSaleSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    banner: z.string().optional(),
    startsAt: z.string().datetime("Invalid start date"),
    endsAt: z.string().datetime("Invalid end date"),
    isActive: z.boolean().optional().default(true),
  }).refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "End date must be after start date",
    path: ["endsAt"],
  }),
});

export const updateFlashSaleSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    banner: z.string().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const addFlashSaleItemSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        salePrice: z.number().positive("Sale price must be positive"),
        stockLimit: z.number().int().positive().optional(),
      })
    ).min(1, "At least 1 item is required"),
  }),
});
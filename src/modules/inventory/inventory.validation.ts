import { z } from "zod";

export const updateInventorySchema = z.object({
  body: z.object({
    stock: z.number().int().min(0, "Stock cannot be negative"),
    lowStockThreshold: z.number().int().min(0).optional(),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    type: z.enum(["INCREMENT", "DECREMENT"]),
    reason: z.string().optional(),
  }),
});
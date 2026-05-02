import { z } from "zod";

export const updateShippingSchema = z.object({
  body: z.object({
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    trackingUrl: z.string().url("Invalid URL").optional(),
    status: z
      .enum([
        "NOT_SHIPPED",
        "PROCESSING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RETURNED",
        "FAILED",
      ])
      .optional(),
    estimatedAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
});
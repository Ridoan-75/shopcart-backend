import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  }),
  params: z.object({
    itemId: z.string().min(1, "Item ID is required"),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Coupon code is required"),
  }),
});
import { z } from "zod";
import { CouponType } from "../../../generated/prisma/enums";

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
    description: z.string().optional(),
    type: z.nativeEnum(CouponType, {
      message: "Invalid coupon type",
    }),
    value: z.number().positive("Value must be positive"),
    minOrderAmount: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).toUpperCase().optional(),
    description: z.string().optional(),
    type: z.nativeEnum(CouponType).optional(),
    value: z.number().positive().optional(),
    minOrderAmount: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Coupon ID is required"),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Coupon code is required"),
    orderAmount: z.number().positive("Order amount must be positive"),
  }),
});

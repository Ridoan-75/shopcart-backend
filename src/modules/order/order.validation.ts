import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const placeOrderSchema = z.object({
  body: z.object({
    addressId: z.string().min(1, "Address is required"),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
    shippingCharge: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      message: "Invalid order status",
    }),
  }),
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});

export const getOrdersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
  }),
});
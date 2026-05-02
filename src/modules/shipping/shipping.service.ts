import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";

// ─── Get Shipping By Order ─────────────────────────────────────────────────────
export const getShippingByOrderService = async (
  orderId: string,
  userId: string,
  role: string
) => {
  const shipping = await prisma.shipping.findUnique({
    where: { orderId },
    include: {
      order: {
        select: {
          id: true,
          userId: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          address: {
            select: {
              fullName: true,
              phone: true,
              street: true,
              city: true,
              state: true,
              country: true,
              postalCode: true,
            },
          },
        },
      },
    },
  });

  if (!shipping) throw new AppError("Shipping info not found", 404);

  // only admin or the order owner can view
  if (role !== "ADMIN" && shipping.order.userId !== userId) {
    throw new AppError("Not authorized to view this shipping info", 403);
  }

  return shipping;
};

// ─── Update Shipping (Admin) ───────────────────────────────────────────────────
export const updateShippingService = async (
  orderId: string,
  payload: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status?: string;
    estimatedAt?: string;
    notes?: string;
  }
) => {
  const shipping = await prisma.shipping.findUnique({ where: { orderId } });
  if (!shipping) throw new AppError("Shipping info not found", 404);

  const data: any = { ...payload };

  // auto set timestamps based on status
  if (payload.status === "SHIPPED" && !shipping.shippedAt) {
    data.shippedAt = new Date();
  }
  if (payload.status === "DELIVERED" && !shipping.deliveredAt) {
    data.deliveredAt = new Date();
  }
  if (payload.status === "RETURNED" && !shipping.returnedAt) {
    data.returnedAt = new Date();
  }

  // also update order status accordingly
  if (payload.status === "DELIVERED") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" },
    });
  }
  if (payload.status === "RETURNED") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
    });
  }

  return prisma.shipping.update({
    where: { orderId },
    data,
    include: {
      order: {
        select: {
          id: true,
          status: true,
          address: {
            select: {
              fullName: true,
              phone: true,
              street: true,
              city: true,
              state: true,
              country: true,
              postalCode: true,
            },
          },
        },
      },
    },
  });
};

// ─── Get All Shippings (Admin) ─────────────────────────────────────────────────
export const getAllShippingsService = async (query: {
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { trackingNumber: { contains: query.search, mode: "insensitive" } },
      { carrier: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.shipping.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            user: { select: { id: true, name: true, email: true } },
            address: {
              select: {
                fullName: true,
                phone: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    }),
    prisma.shipping.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
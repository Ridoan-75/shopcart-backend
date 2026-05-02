import { db } from "../../config/db";
import { AppError } from "../../utils/apiError";
import { calculateDiscount } from "../coupon/coupon.service";
import { IOrderFilters, IPlaceOrder, IUpdateOrderStatus } from "./order.interface";

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${timestamp}-${random}`;
};

const orderInclude = {
  items: true,
  address: {
    select: {
      id: true,
      label: true,
      fullName: true,
      phone: true,
      addressLine: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
    },
  },
  coupon: {
    select: { id: true, code: true, type: true, value: true },
  },
  payment: {
    select: { id: true, method: true, status: true, amount: true },
  },
};

export const placeOrderService = async (userId: string, input: IPlaceOrder) => {
  const { addressId, couponCode, notes, shippingCharge = 0, tax = 0 } = input;

  // Cart check
  const cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              isActive: true,
              images: true,
              inventory: { select: { quantity: true } },
            },
          },
        },
      },
      coupon: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // Address check
  const address = await db.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError("Address not found", 404);

  // Stock check
  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw new AppError(`${item.product.name} is no longer available`, 400);
    }
    const availableStock = item.product.inventory?.quantity ?? 0;
    if (availableStock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
    }
  }

  // Coupon resolve (cart coupon or manual code)
  let coupon = cart.coupon;
  if (couponCode && !coupon) {
    coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new AppError("Invalid coupon code", 400);
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  let discount = 0;
  if (coupon) {
    discount = calculateDiscount(coupon as any, subtotal);
  }
  const total = subtotal - discount + shippingCharge + tax;

  // Create order in transaction
  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        couponId: coupon?.id ?? null,
        subtotal,
        discount,
        shippingCharge,
        tax,
        total,
        notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productSku: item.product.sku,
            image: item.product.images[0] ?? null,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
        },
      },
      include: orderInclude,
    });

    // Decrease stock
    for (const item of cart.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Increment coupon usage
    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    return newOrder;
  });

  return order;
};

export const getMyOrdersService = async (userId: string, filters: IOrderFilters) => {
  const { page = 1, limit = 10, status } = filters;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getOrderByIdService = async (userId: string, orderId: string) => {
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

export const cancelOrderService = async (userId: string, orderId: string) => {
  const order = await db.order.findFirst({ where: { id: orderId, userId } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.status !== "PENDING") {
    throw new AppError("Only PENDING orders can be cancelled", 400);
  }

  const updatedOrder = await db.$transaction(async (tx) => {
    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: orderInclude,
    });

    // Restore stock
    for (const item of cancelled.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    // Decrement coupon usage
    if (cancelled.couponId) {
      await tx.coupon.update({
        where: { id: cancelled.couponId },
        data: { usedCount: { decrement: 1 } },
      });
    }

    return cancelled;
  });

  return updatedOrder;
};

export const getAllOrdersAdminService = async (filters: IOrderFilters) => {
  const { page = 1, limit = 10, status, startDate, endDate, search } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        ...orderInclude,
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updateOrderStatusService = async (
  orderId: string,
  input: IUpdateOrderStatus
) => {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);

  const updated = await db.order.update({
    where: { id: orderId },
    data: { status: input.status },
    include: orderInclude,
  });

  return updated;
};
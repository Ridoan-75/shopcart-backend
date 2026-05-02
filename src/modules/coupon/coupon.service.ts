import { db } from "../../config/db";
import { AppError } from "../../utils/apiError";
import { ICreateCoupon, IUpdateCoupon, IValidateCoupon } from "./coupon.interface";

const couponSelect = {
  id: true,
  code: true,
  description: true,
  type: true,
  value: true,
  minOrderAmount: true,
  maxDiscount: true,
  usageLimit: true,
  usedCount: true,
  perUserLimit: true,
  isActive: true,
  startsAt: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
};

export const calculateDiscount = (
  coupon: { type: string; value: number; maxDiscount: number | null },
  orderAmount: number
): number => {
  let discount = 0;

  if (coupon.type === "PERCENTAGE") {
    discount = (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }

  return Math.min(discount, orderAmount);
};

export const getAllCouponsService = async () => {
  const coupons = await db.coupon.findMany({
    select: couponSelect,
    orderBy: { createdAt: "desc" },
  });

  return { coupons, total: coupons.length };
};

export const validateCouponService = async (userId: string, input: IValidateCoupon) => {
  const { code, orderAmount } = input;

  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) throw new AppError("Invalid coupon code", 404);
  if (!coupon.isActive) throw new AppError("Coupon is not active", 400);

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    throw new AppError("Coupon is not yet active", 400);
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    throw new AppError("Coupon has expired", 400);
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit reached", 400);
  }
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount is ${coupon.minOrderAmount} to use this coupon`, 400);
  }

  // Per user limit check
  const userUsageCount = await db.order.count({
    where: { userId, couponId: coupon.id },
  });
  if (userUsageCount >= coupon.perUserLimit) {
    throw new AppError("You have reached the usage limit for this coupon", 400);
  }

  const discountAmount = calculateDiscount(coupon, orderAmount);
  const finalAmount = orderAmount - discountAmount;

  return { isValid: true, coupon, discountAmount, finalAmount };
};

export const createCouponService = async (input: ICreateCoupon) => {
  const existing = await db.coupon.findUnique({
    where: { code: input.code.toUpperCase() },
  });
  if (existing) throw new AppError("Coupon code already exists", 409);

  const coupon = await db.coupon.create({
    data: {
      ...input,
      code: input.code.toUpperCase(),
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
    select: couponSelect,
  });

  return coupon;
};

export const updateCouponService = async (id: string, input: IUpdateCoupon) => {
  const existing = await db.coupon.findUnique({ where: { id } });
  if (!existing) throw new AppError("Coupon not found", 404);

  if (input.code) {
    const codeExists = await db.coupon.findFirst({
      where: { code: input.code.toUpperCase(), NOT: { id } },
    });
    if (codeExists) throw new AppError("Coupon code already exists", 409);
  }

  const coupon = await db.coupon.update({
    where: { id },
    data: {
      ...input,
      code: input.code ? input.code.toUpperCase() : undefined,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
    select: couponSelect,
  });

  return coupon;
};

export const deleteCouponService = async (id: string) => {
  const existing = await db.coupon.findUnique({ where: { id } });
  if (!existing) throw new AppError("Coupon not found", 404);

  await db.coupon.delete({ where: { id } });
};
import { CouponType } from "@prisma/client";

export interface ICreateCoupon {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
}

export interface IUpdateCoupon extends Partial<ICreateCoupon> {}

export interface IValidateCoupon {
  code: string;
  orderAmount: number;
}

export interface ICouponResponse {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IValidateCouponResponse {
  isValid: boolean;
  coupon: ICouponResponse;
  discountAmount: number;
  finalAmount: number;
}
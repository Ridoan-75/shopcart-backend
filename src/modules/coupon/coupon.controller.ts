import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createCouponService,
  deleteCouponService,
  getAllCouponsService,
  updateCouponService,
  validateCouponService,
} from "./coupon.service";

export const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const data = await getAllCouponsService();
  sendResponse(res, 200, true, "Coupons fetched", data);
});

export const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await validateCouponService(userId, req.body);
  sendResponse(res, 200, true, "Coupon is valid", data);
});

export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const data = await createCouponService(req.body);
  sendResponse(res, 201, true, "Coupon created", data);
});

export const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const data = await updateCouponService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Coupon updated", data);
});

export const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  await deleteCouponService(req.params.id as string);
  sendResponse(res, 200, true, "Coupon deleted");
});
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  addToCartService,
  applyCouponService,
  clearCartService,
  getCartService,
  removeCartItemService,
  removeCouponService,
  updateCartItemService,
} from "./cart.service";

export const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await getCartService(userId);
  sendResponse(res, 200, true, "Cart fetched", data);
});

export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await addToCartService(userId, req.body);
  sendResponse(res, 200, true, "Item added to cart", data);
});

export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await updateCartItemService(userId, req.params.itemId as string, req.body);
  sendResponse(res, 200, true, "Cart item updated", data);
});

export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await removeCartItemService(userId, req.params.itemId as string);
  sendResponse(res, 200, true, "Item removed from cart", data);
});

export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await clearCartService(userId);
  sendResponse(res, 200, true, "Cart cleared", data);
});

export const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await applyCouponService(userId, req.body);
  sendResponse(res, 200, true, "Coupon applied", data);
});

export const removeCoupon = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await removeCouponService(userId);
  sendResponse(res, 200, true, "Coupon removed", data);
});
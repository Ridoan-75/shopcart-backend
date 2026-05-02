import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  addToWishlistService,
  getWishlistService,
  removeFromWishlistService,
  toggleWishlistService,
} from "./wishlist.service";

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await getWishlistService(userId);
  sendResponse(res, 200, true, "Wishlist fetched", data);
});

export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await addToWishlistService(userId, req.body);
  sendResponse(res, 201, true, "Added to wishlist", data);
});

export const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  await removeFromWishlistService(userId, req.params.productId as string);
  sendResponse(res, 200, true, "Removed from wishlist");
});

export const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await toggleWishlistService(userId, req.body);
  sendResponse(res, 200, true, data.message, data);
});
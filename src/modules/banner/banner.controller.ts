import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createBannerService,
  getActiveBannersService,
  getAllBannersService,
  updateBannerService,
  deleteBannerService,
  toggleBannerStatusService,
} from "./banner.service";

export const createBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await createBannerService(req.body);
  sendResponse(res, 201, true, "Banner created", banner);
});

export const getActiveBanners = catchAsync(
  async (req: Request, res: Response) => {
    const banners = await getActiveBannersService(req.query as any);
    sendResponse(res, 200, true, "Active banners fetched", banners);
  }
);

export const getAllBanners = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllBannersService(req.query as any);
  sendResponse(res, 200, true, "All banners fetched", result.data, result.meta);
});

export const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await updateBannerService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Banner updated", banner);
});

export const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteBannerService(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});

export const toggleBannerStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await toggleBannerStatusService(req.params.id as string);
    sendResponse(
      res,
      200,
      true,
      `Banner ${result.isActive ? "activated" : "deactivated"}`,
      result
    );
  }
);
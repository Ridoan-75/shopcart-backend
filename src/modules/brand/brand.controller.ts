import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createBrandService,
  getAllBrandsService,
  getSingleBrandService,
  updateBrandService,
  deleteBrandService,
  toggleBrandStatusService,
} from "./brand.service";

export const createBrand = catchAsync(async (req: Request, res: Response) => {
  const brand = await createBrandService(req.body);
  sendResponse(res, 201, true, "Brand created", brand);
});

export const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllBrandsService(req.query as any);
  sendResponse(res, 200, true, "Brands fetched", result.data, result.meta);
});

export const getSingleBrand = catchAsync(async (req: Request, res: Response) => {
  const brand = await getSingleBrandService(req.params.slug as string);
  sendResponse(res, 200, true, "Brand fetched", brand);
});

export const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const brand = await updateBrandService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Brand updated", brand);
});

export const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteBrandService(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});

export const toggleBrandStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await toggleBrandStatusService(req.params.id as string);
  sendResponse(res, 200, true, `Brand ${result.isActive ? "activated" : "deactivated"}`, result);
});
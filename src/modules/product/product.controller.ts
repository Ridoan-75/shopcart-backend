import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createProductService,
  getAllProductsService,
  getSingleProductService,
  updateProductService,
  deleteProductService,
  toggleProductStatusService,
  toggleProductFlagService,
  getRelatedProductsService,
} from "./product.service";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await createProductService(req.body);
  sendResponse(res, 201, true, "Product created", product);
});

export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllProductsService(req.query as any);
  sendResponse(res, 200, true, "Products fetched", result.data, result.meta);
});

export const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await getSingleProductService(req.params.slug as string);
  sendResponse(res, 200, true, "Product fetched", product);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await updateProductService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Product updated", product);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteProductService(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});

export const toggleProductStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await toggleProductStatusService(req.params.id as string);
  sendResponse(res, 200, true, `Product ${result.isActive ? "activated" : "deactivated"}`, result);
});

export const toggleProductFlag = catchAsync(async (req: Request, res: Response) => {
  const flag = req.params.flag as "isFeatured" | "isNewArrival" | "isBestSeller";
  const validFlags = ["isFeatured", "isNewArrival", "isBestSeller"];
  if (!validFlags.includes(flag)) {
    sendResponse(res, 400, false, "Invalid flag");
    return;
  }
  const result = await toggleProductFlagService(req.params.id as string, flag);
  sendResponse(res, 200, true, "Product flag toggled", result);
});

export const getRelatedProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await getRelatedProductsService(req.params.slug as string);
  sendResponse(res, 200, true, "Related products fetched", products);
});
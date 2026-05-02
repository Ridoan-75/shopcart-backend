import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryTreeService,
  getSingleCategoryService,
  updateCategoryService,
  deleteCategoryService,
  toggleCategoryStatusService,
} from "./category.service";

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await createCategoryService(req.body);
  sendResponse(res, 201, true, "Category created", category);
});

export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllCategoriesService(req.query as any);
  sendResponse(res, 200, true, "Categories fetched", result.data, result.meta);
});

export const getCategoryTree = catchAsync(async (req: Request, res: Response) => {
  const tree = await getCategoryTreeService();
  sendResponse(res, 200, true, "Category tree fetched", tree);
});

export const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await getSingleCategoryService(req.params.slug as string);
  sendResponse(res, 200, true, "Category fetched", category);
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await updateCategoryService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Category updated", category);
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteCategoryService(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});

export const toggleCategoryStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await toggleCategoryStatusService(req.params.id as string);
  sendResponse(res, 200, true, `Category ${result.isActive ? "activated" : "deactivated"}`, result);
});
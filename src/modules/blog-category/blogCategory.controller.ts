import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createBlogCategoryService,
  getAllBlogCategoriesService,
  updateBlogCategoryService,
  deleteBlogCategoryService,
} from "./blogCategory.service";

export const createBlogCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await createBlogCategoryService(req.body);
  sendResponse(res, 201, true, "Blog category created", category);
});

export const getAllBlogCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await getAllBlogCategoriesService();
  sendResponse(res, 200, true, "Blog categories fetched", categories);
});

export const updateBlogCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await updateBlogCategoryService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Blog category updated", category);
});

export const deleteBlogCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteBlogCategoryService(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});
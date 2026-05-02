import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createBlogService,
  getAllBlogsService,
  getAllBlogsAdminService,
  getSingleBlogService,
  updateBlogService,
  deleteBlogService,
  toggleBlogFeaturedService,
} from "./blog.service";

export const createBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await createBlogService(req.user!.id, req.body);
  sendResponse(res, 201, true, "Blog created", blog);
});

export const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllBlogsService(req.query as any);
  sendResponse(res, 200, true, "Blogs fetched", result.data, result.meta);
});

export const getAllBlogsAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllBlogsAdminService(req.query as any);
  sendResponse(res, 200, true, "All blogs fetched", result.data, result.meta);
});

export const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await getSingleBlogService(req.params.slug as string);
  sendResponse(res, 200, true, "Blog fetched", blog);
});

export const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await updateBlogService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Blog updated", blog);
});

export const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteBlogService(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});

export const toggleBlogFeatured = catchAsync(async (req: Request, res: Response) => {
  const result = await toggleBlogFeaturedService(req.params.id as string);
  sendResponse(res, 200, true, `Blog ${result.isFeatured ? "featured" : "unfeatured"}`, result);
});
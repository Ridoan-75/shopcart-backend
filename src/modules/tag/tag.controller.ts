import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createTagService,
  bulkCreateTagService,
  getAllTagsService,
  getSingleTagService,
  updateTagService,
  deleteTagService,
  bulkDeleteTagService,
} from "./tag.service";

export const createTag = catchAsync(async (req: Request, res: Response) => {
  const tag = await createTagService(req.body.name);
  sendResponse(res, 201, true, "Tag created", tag);
});

export const bulkCreateTag = catchAsync(async (req: Request, res: Response) => {
  const tags = await bulkCreateTagService(req.body.names);
  sendResponse(res, 201, true, "Tags created", tags);
});

export const getAllTags = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllTagsService(req.query as any);
  sendResponse(res, 200, true, "Tags fetched", result.data, result.meta);
});

export const getSingleTag = catchAsync(async (req: Request, res: Response) => {
  const tag = await getSingleTagService(req.params.slug as string);
  sendResponse(res, 200, true, "Tag fetched", tag);
});

export const updateTag = catchAsync(async (req: Request, res: Response) => {
  const tag = await updateTagService(req.params.id as string, req.body.name);
  sendResponse(res, 200, true, "Tag updated", tag);
});

export const deleteTag = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteTagService(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});

export const bulkDeleteTag = catchAsync(async (req: Request, res: Response) => {
  const result = await bulkDeleteTagService(req.body.ids as string[]);
  sendResponse(res, 200, true, result.message);
});
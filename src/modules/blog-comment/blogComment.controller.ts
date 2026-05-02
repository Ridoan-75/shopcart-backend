import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createCommentService,
  getAllCommentsService,
  approveCommentService,
  deleteCommentService,
} from "./blogComment.service";

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const comment = await createCommentService(req.user!.id, req.body);
  sendResponse(res, 201, true, "Comment submitted, pending approval", comment);
});

export const getAllComments = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllCommentsService(req.query as any);
  sendResponse(res, 200, true, "Comments fetched", result.data, result.meta);
});

export const approveComment = catchAsync(async (req: Request, res: Response) => {
  const result = await approveCommentService(req.params.id as string);
  sendResponse(res, 200, true, `Comment ${result.isApproved ? "approved" : "unapproved"}`, result);
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteCommentService(
    req.params.id as string,
    req.user!.id,
    req.user!.role
  );
  sendResponse(res, 200, true, result.message);
});
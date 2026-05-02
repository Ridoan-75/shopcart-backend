import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createReviewService,
  getProductReviewsService,
  getAllReviewsService,
  updateReviewService,
  deleteReviewService,
  approveReviewService,
  markHelpfulService,
} from "./review.service";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const review = await createReviewService(req.user!.id, req.body);
  sendResponse(res, 201, true, "Review submitted, pending approval", review);
});

export const getProductReviews = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getProductReviewsService(
      req.params.productId as string,
      req.query as any,
    );
    sendResponse(res, 200, true, "Reviews fetched", result.data, result.meta);
  },
);

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllReviewsService(req.query as any);
  sendResponse(res, 200, true, "All reviews fetched", result.data, result.meta);
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const review = await updateReviewService(
    req.params.id as string,
    req.user!.id,
    req.body,
  );
  sendResponse(res, 200, true, "Review updated", review);
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteReviewService(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
  );
  sendResponse(res, 200, true, result.message);
});

export const approveReview = catchAsync(async (req: Request, res: Response) => {
  const result = await approveReviewService(req.params.id as string);
  sendResponse(
    res,
    200,
    true,
    `Review ${result.isApproved ? "approved" : "unapproved"}`,
    result,
  );
});

export const markHelpful = catchAsync(async (req: Request, res: Response) => {
  const result = await markHelpfulService(req.params.id as string);
  sendResponse(res, 200, true, "Marked as helpful", result);
});

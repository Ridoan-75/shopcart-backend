import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  getUserRecommendationsService,
  getSimilarProductsService,
  getSearchSuggestionsService,
  getTrendingProductsService,
  aiChatService,
} from "./ai.service";

export const getUserRecommendations = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getUserRecommendationsService(req.params.userId as string);
    sendResponse(res, 200, true, "Recommendations fetched", result);
  }
);

export const getSimilarProducts = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getSimilarProductsService(req.params.productId as string);
    sendResponse(res, 200, true, "Similar products fetched", result);
  }
);

export const getSearchSuggestions = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const userId = req.user?.id;
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString();
    const result = await getSearchSuggestionsService(query, userId, ip);
    sendResponse(res, 200, true, "Suggestions fetched", result);
  }
);

export const getTrendingProducts = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getTrendingProductsService();
    sendResponse(res, 200, true, "Trending products fetched", result);
  }
);

export const aiChat = catchAsync(async (req: Request, res: Response) => {
  const result = await aiChatService(req.user!.id, req.body.message);
  sendResponse(res, 200, true, "AI response", result);
});
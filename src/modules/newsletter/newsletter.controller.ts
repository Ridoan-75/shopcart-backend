import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  subscribeService,
  unsubscribeService,
  getAllSubscribersService,
  deleteSubscriberService,
} from "./newsletter.service";

export const subscribe = catchAsync(async (req: Request, res: Response) => {
  const result = await subscribeService(req.body);
  sendResponse(res, 201, true, "Subscribed successfully", result);
});

export const unsubscribe = catchAsync(async (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = await unsubscribeService(token);
  sendResponse(res, 200, true, result.message);
});

export const getAllSubscribers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllSubscribersService(req.query as any);
    sendResponse(
      res,
      200,
      true,
      "Subscribers fetched",
      { data: result.data, stats: result.stats },
      result.meta
    );
  }
);

export const deleteSubscriber = catchAsync(
  async (req: Request, res: Response) => {
    const result = await deleteSubscriberService(req.params.id as string);
    sendResponse(res, 200, true, result.message);
  }
);
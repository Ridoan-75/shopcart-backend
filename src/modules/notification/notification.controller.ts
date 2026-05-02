import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  getUserNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
  deleteAllReadService,
  sendNotificationService,
  broadcastNotificationService,
} from "./notification.service";

export const getUserNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getUserNotificationsService(
      req.user!.id,
      req.query as any
    );
    sendResponse(
      res,
      200,
      true,
      "Notifications fetched",
      { data: result.data, unreadCount: result.unreadCount },
      result.meta
    );
  }
);

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await markAsReadService(req.params.id as string, req.user!.id);
  sendResponse(res, 200, true, "Marked as read", result);
});

export const markAllAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const result = await markAllAsReadService(req.user!.id);
    sendResponse(res, 200, true, result.message);
  }
);

export const deleteNotification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await deleteNotificationService(
      req.params.id as string,
      req.user!.id
    );
    sendResponse(res, 200, true, result.message);
  }
);

export const deleteAllRead = catchAsync(
  async (req: Request, res: Response) => {
    const result = await deleteAllReadService(req.user!.id);
    sendResponse(res, 200, true, result.message);
  }
);

export const sendNotification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await sendNotificationService(req.body);
    sendResponse(res, 201, true, "Notification sent", result);
  }
);

export const broadcastNotification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await broadcastNotificationService(req.body);
    sendResponse(res, 200, true, result.message);
  }
);
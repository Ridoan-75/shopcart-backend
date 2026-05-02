import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createPaymentSessionService,
  getAllPaymentsAdminService,
  getPaymentByOrderIdService,
  handleStripeWebhookService,
} from "./payment.service";

export const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await createPaymentSessionService(userId, req.body);
  sendResponse(res, 201, true, "Payment session created", data);
});

export const stripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  try {
    const data = await handleStripeWebhookService(req.body, signature);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentByOrderId = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await getPaymentByOrderIdService(userId, req.params.orderId as string);
  sendResponse(res, 200, true, "Payment fetched", data);
});

export const getAllPaymentsAdmin = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    status: req.query.status as any,
    method: req.query.method as any,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  };
  const data = await getAllPaymentsAdminService(filters);
  sendResponse(res, 200, true, "All payments fetched", data);
});
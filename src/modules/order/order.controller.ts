import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  cancelOrderService,
  getAllOrdersAdminService,
  getMyOrdersService,
  getOrderByIdService,
  placeOrderService,
  updateOrderStatusService,
} from "./order.service";

export const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await placeOrderService(userId, req.body);
  sendResponse(res, 201, true, "Order placed successfully", data);
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    status: req.query.status as any,
  };
  const data = await getMyOrdersService(userId, filters);
  sendResponse(res, 200, true, "Orders fetched", data);
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await getOrderByIdService(userId, req.params.id as string);
  sendResponse(res, 200, true, "Order fetched", data);
});

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data = await cancelOrderService(userId, req.params.id as string);
  sendResponse(res, 200, true, "Order cancelled", data);
});

export const getAllOrdersAdmin = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    status: req.query.status as any,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    search: req.query.search as string,
  };
  const data = await getAllOrdersAdminService(filters);
  sendResponse(res, 200, true, "All orders fetched", data);
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await updateOrderStatusService(req.params.id as string, req.body);
  sendResponse(res, 200, true, "Order status updated", data);
});
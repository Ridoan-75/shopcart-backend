import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  getShippingByOrderService,
  updateShippingService,
  getAllShippingsService,
} from "./shipping.service";

export const getShippingByOrder = catchAsync(
  async (req: Request, res: Response) => {
    const shipping = await getShippingByOrderService(
      req.params.orderId as string,
      req.user!.id,
      req.user!.role
    );
    sendResponse(res, 200, true, "Shipping info fetched", shipping);
  }
);

export const updateShipping = catchAsync(
  async (req: Request, res: Response) => {
    const shipping = await updateShippingService(
      req.params.orderId as string,
      req.body
    );
    sendResponse(res, 200, true, "Shipping updated", shipping);
  }
);

export const getAllShippings = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllShippingsService(req.query as any);
    sendResponse(res, 200, true, "Shippings fetched", result.data, result.meta);
  }
);
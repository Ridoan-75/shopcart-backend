import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createFlashSaleService,
  addFlashSaleItemsService,
  getActiveFlashSalesService,
  getAllFlashSalesService,
  getSingleFlashSaleService,
  updateFlashSaleService,
  deleteFlashSaleService,
  removeFlashSaleItemService,
} from "./flashSale.service";

export const createFlashSale = catchAsync(
  async (req: Request, res: Response) => {
    const result = await createFlashSaleService(req.body);
    sendResponse(res, 201, true, "Flash sale created", result);
  },
);

export const addFlashSaleItems = catchAsync(
  async (req: Request, res: Response) => {
    const result = await addFlashSaleItemsService(
      req.params.id as string,
      req.body.items,
    );
    sendResponse(res, 201, true, "Items added to flash sale", result);
  },
);

export const getActiveFlashSales = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getActiveFlashSalesService();
    sendResponse(res, 200, true, "Active flash sales fetched", result);
  },
);

export const getAllFlashSales = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllFlashSalesService(req.query as any);
    sendResponse(
      res,
      200,
      true,
      "Flash sales fetched",
      result.data,
      result.meta,
    );
  },
);

export const getSingleFlashSale = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getSingleFlashSaleService(req.params.id as string);
    sendResponse(res, 200, true, "Flash sale fetched", result);
  },
);

export const updateFlashSale = catchAsync(
  async (req: Request, res: Response) => {
    const result = await updateFlashSaleService(
      req.params.id as string,
      req.body,
    );
    sendResponse(res, 200, true, "Flash sale updated", result);
  },
);

export const deleteFlashSale = catchAsync(
  async (req: Request, res: Response) => {
    const result = await deleteFlashSaleService(req.params.id as string);
    sendResponse(res, 200, true, result.message);
  },
);

export const removeFlashSaleItem = catchAsync(
  async (req: Request, res: Response) => {
    const result = await removeFlashSaleItemService(
      req.params.id as string,
      req.params.itemId as string,
    );
    sendResponse(res, 200, true, result.message);
  },
);

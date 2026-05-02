import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  getInventoryByProductService,
  getAllInventoriesService,
  updateInventoryService,
  adjustStockService,
  getLowStockProductsService,
  getOutOfStockProductsService,
} from "./inventory.service";

export const getInventoryByProduct = catchAsync(
  async (req: Request, res: Response) => {
    const inventory = await getInventoryByProductService(req.params.productId as string);
    sendResponse(res, 200, true, "Inventory fetched", inventory);
  }
);

export const getAllInventories = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllInventoriesService(req.query as any);
    sendResponse(res, 200, true, "Inventories fetched", result.data, result.meta);
  }
);

export const updateInventory = catchAsync(
  async (req: Request, res: Response) => {
    const inventory = await updateInventoryService(
      req.params.productId as string,
      req.body
    );
    sendResponse(res, 200, true, "Inventory updated", inventory);
  }
);

export const adjustStock = catchAsync(async (req: Request, res: Response) => {
  const inventory = await adjustStockService(req.params.productId as string, req.body);
  sendResponse(res, 200, true, "Stock adjusted", inventory);
});

export const getLowStockProducts = catchAsync(
  async (req: Request, res: Response) => {
    const products = await getLowStockProductsService();
    sendResponse(res, 200, true, "Low stock products fetched", products);
  }
);

export const getOutOfStockProducts = catchAsync(
  async (req: Request, res: Response) => {
    const products = await getOutOfStockProductsService();
    sendResponse(res, 200, true, "Out of stock products fetched", products);
  }
);
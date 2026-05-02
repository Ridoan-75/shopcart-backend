import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  getDashboardStatsService,
  getSalesChartService,
  getTopProductsService,
  getRecentOrdersService,
  getLowStockDashboardService,
  getOrderStatusBreakdownService,
  getUserRoleBreakdownService,
} from "./dashboard.service";

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await getDashboardStatsService();
    sendResponse(res, 200, true, "Dashboard stats fetched", stats);
  },
);

export const getSalesChart = catchAsync(async (req: Request, res: Response) => {
  const period =
    (req.query.period as "daily" | "weekly" | "monthly") || "monthly";
  const result = await getSalesChartService(period);
  sendResponse(res, 200, true, "Sales chart fetched", result);
});

export const getTopProducts = catchAsync(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const products = await getTopProductsService(limit);
    sendResponse(res, 200, true, "Top products fetched", products);
  },
);

export const getRecentOrders = catchAsync(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const orders = await getRecentOrdersService(limit);
    sendResponse(res, 200, true, "Recent orders fetched", orders);
  },
);

export const getLowStockDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const products = await getLowStockDashboardService();
    sendResponse(res, 200, true, "Low stock products fetched", products);
  },
);

export const getOrderStatusBreakdown = catchAsync(
  async (req: Request, res: Response) => {
    const breakdown = await getOrderStatusBreakdownService();
    sendResponse(res, 200, true, "Order status breakdown fetched", breakdown);
  },
);

export const getUserRoleBreakdown = catchAsync(
  async (req: Request, res: Response) => {
    const breakdown = await getUserRoleBreakdownService();
    sendResponse(res, 200, true, "User role breakdown fetched", breakdown);
  },
);

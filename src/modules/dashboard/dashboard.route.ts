import { Router } from "express";
import {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getRecentOrders,
  getLowStockDashboard,
  getOrderStatusBreakdown,
  getUserRoleBreakdown,
} from "./dashboard.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../types/enum";

const router = Router();

// ─── All Admin Only ────────────────────────────────────────────────────────────
router.use(authenticate, authorize(Role.ADMIN));

router.get("/stats", getDashboardStats);
router.get("/sales-chart", getSalesChart);
router.get("/top-products", getTopProducts);
router.get("/recent-orders", getRecentOrders);
router.get("/low-stock", getLowStockDashboard);
router.get("/order-status", getOrderStatusBreakdown);
router.get("/user-roles", getUserRoleBreakdown);

export default router;

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "../../types/enum";

import {
  cancelOrder,
  getAllOrdersAdmin,
  getMyOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
} from "./order.controller";
import {
  getOrdersQuerySchema,
  placeOrderSchema,
  updateOrderStatusSchema,
} from "./order.validation";

const router = Router();

// User routes
router.post("/", authenticate, validate(placeOrderSchema), placeOrder);
router.get("/", authenticate, validate(getOrdersQuerySchema), getMyOrders);
router.get("/:id", authenticate, getOrderById);
router.post("/:id/cancel", authenticate, cancelOrder);

// Admin routes
router.get(
  "/admin/all",
  authenticate,
  authorize(Role.ADMIN),
  validate(getOrdersQuerySchema),
  getAllOrdersAdmin
);
router.patch(
  "/:id/status",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
import { Router } from "express";
import {
  getInventoryByProduct,
  getAllInventories,
  updateInventory,
  adjustStock,
  getLowStockProducts,
  getOutOfStockProducts,
} from "./inventory.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateInventorySchema, adjustStockSchema } from "./inventory.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  getAllInventories
);
router.get(
  "/low-stock",
  authenticate,
  authorize(Role.ADMIN),
  getLowStockProducts
);
router.get(
  "/out-of-stock",
  authenticate,
  authorize(Role.ADMIN),
  getOutOfStockProducts
);
router.get(
  "/:productId",
  authenticate,
  authorize(Role.ADMIN, Role.SELLER),
  getInventoryByProduct
);
router.put(
  "/:productId",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateInventorySchema),
  updateInventory
);
router.patch(
  "/:productId/adjust",
  authenticate,
  authorize(Role.ADMIN, Role.SELLER),
  validate(adjustStockSchema),
  adjustStock
);

export default router;
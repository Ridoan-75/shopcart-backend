import { Router } from "express";
import {
  createFlashSale,
  addFlashSaleItems,
  getActiveFlashSales,
  getAllFlashSales,
  getSingleFlashSale,
  updateFlashSale,
  deleteFlashSale,
  removeFlashSaleItem,
} from "./flashSale.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createFlashSaleSchema,
  updateFlashSaleSchema,
  addFlashSaleItemSchema,
} from "./flashSale.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/active", getActiveFlashSales);
router.get("/:id", getSingleFlashSale);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get("/", authenticate, authorize(Role.ADMIN), getAllFlashSales);
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createFlashSaleSchema),
  createFlashSale,
);
router.post(
  "/:id/items",
  authenticate,
  authorize(Role.ADMIN),
  validate(addFlashSaleItemSchema),
  addFlashSaleItems,
);
router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateFlashSaleSchema),
  updateFlashSale,
);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteFlashSale);
router.delete(
  "/:id/items/:itemId",
  authenticate,
  authorize(Role.ADMIN),
  removeFlashSaleItem,
);

export default router;

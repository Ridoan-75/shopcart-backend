import { Router } from "express";
import {
  getShippingByOrder,
  updateShipping,
  getAllShippings,
} from "./shipping.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateShippingSchema } from "./shipping.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  getAllShippings
);

// ─── Auth (owner or admin) ─────────────────────────────────────────────────────
router.get("/:orderId", authenticate, getShippingByOrder);

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.patch(
  "/:orderId",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateShippingSchema),
  updateShipping
);

export default router;
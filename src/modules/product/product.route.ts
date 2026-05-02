import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleProductFlag,
  getRelatedProducts,
} from "./product.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "./product.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllProducts);
router.get("/:slug", getSingleProduct);
router.get("/:slug/related", getRelatedProducts);

// ─── Admin / Seller ────────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.SELLER),
  validate(createProductSchema),
  createProduct
);
router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN, Role.SELLER),
  validate(updateProductSchema),
  updateProduct
);

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteProduct);
router.patch("/:id/toggle", authenticate, authorize(Role.ADMIN), toggleProductStatus);
router.patch("/:id/flag/:flag", authenticate, authorize(Role.ADMIN), toggleProductFlag);

export default router;
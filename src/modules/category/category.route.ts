import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryTree,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "./category.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllCategories);
router.get("/tree", getCategoryTree);
router.get("/:slug", getSingleCategory);

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createCategorySchema),
  createCategory,
);
router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateCategorySchema),
  updateCategory,
);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteCategory);
router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.ADMIN),
  toggleCategoryStatus,
);

export default router;

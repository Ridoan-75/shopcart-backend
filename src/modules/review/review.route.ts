import { Router } from "express";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview,
  approveReview,
  markHelpful,
} from "./review.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createReviewSchema, updateReviewSchema } from "./review.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/product/:productId", getProductReviews);
router.patch("/:id/helpful", markHelpful);

// ─── Auth ──────────────────────────────────────────────────────────────────────
router.post("/", authenticate, validate(createReviewSchema), createReview);
router.patch("/:id", authenticate, validate(updateReviewSchema), updateReview);
router.delete("/:id", authenticate, deleteReview);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get("/", authenticate, authorize(Role.ADMIN), getAllReviews);
router.patch(
  "/:id/approve",
  authenticate,
  authorize(Role.ADMIN),
  approveReview,
);

export default router;

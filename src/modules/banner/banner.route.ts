import { Router } from "express";
import {
  createBanner,
  getActiveBanners,
  getAllBanners,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "./banner.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createBannerSchema, updateBannerSchema } from "./banner.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/", getActiveBanners);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get("/all", authenticate, authorize(Role.ADMIN), getAllBanners);
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createBannerSchema),
  createBanner,
);
router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateBannerSchema),
  updateBanner,
);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteBanner);
router.patch(
  "/:id/toggle",
  authenticate,
  authorize(Role.ADMIN),
  toggleBannerStatus,
);

export default router;

import { Router } from "express";
import {
  uploadImage,
  uploadImages,
  deleteImage,
  getAllUploads,
} from "./upload.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../types/enum";

const router = Router();

// ─── Admin & Seller ────────────────────────────────────────────────────────────
router.post(
  "/image",
  authenticate,
  authorize(Role.ADMIN, Role.SELLER),
  uploadImage,
);
router.post(
  "/images",
  authenticate,
  authorize(Role.ADMIN, Role.SELLER),
  uploadImages,
);
router.delete("/:publicId", authenticate, authorize(Role.ADMIN), deleteImage);

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.get("/", authenticate, authorize(Role.ADMIN), getAllUploads);

export default router;

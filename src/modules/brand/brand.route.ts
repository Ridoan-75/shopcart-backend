import { Router } from "express";
import {
  createBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
} from "./brand.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createBrandSchema, updateBrandSchema } from "./brand.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllBrands);
router.get("/:slug", getSingleBrand);

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.post("/", authenticate, authorize(Role.ADMIN), validate(createBrandSchema), createBrand);
router.patch("/:id", authenticate, authorize(Role.ADMIN), validate(updateBrandSchema), updateBrand);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteBrand);
router.patch("/:id/toggle", authenticate, authorize(Role.ADMIN), toggleBrandStatus);

export default router;
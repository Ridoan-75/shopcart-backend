import { Router } from "express";
import {
  createAddress,
  getUserAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllAddressesAdmin,
} from "./address.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createAddressSchema, updateAddressSchema } from "./address.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── User ──────────────────────────────────────────────────────────────────────
router.post("/", authenticate, validate(createAddressSchema), createAddress);
router.get("/", authenticate, getUserAddresses);
router.get("/:id", authenticate, getSingleAddress);
router.patch("/:id", authenticate, validate(updateAddressSchema), updateAddress);
router.delete("/:id", authenticate, deleteAddress);
router.patch("/:id/set-default", authenticate, setDefaultAddress);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get(
  "/admin/all",
  authenticate,
  authorize(Role.ADMIN),
  getAllAddressesAdmin
);

export default router;
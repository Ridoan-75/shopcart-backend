import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { Role } from "../../types/enum";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
  validateCoupon,
} from "./coupon.controller";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "./coupon.validation";

const router = Router();

router.get("/", authenticate, authorize(Role.ADMIN), getAllCoupons);
router.post("/validate", authenticate, validate(validateCouponSchema), validateCoupon);
router.post("/", authenticate, authorize(Role.ADMIN), validate(createCouponSchema), createCoupon);
router.patch("/:id", authenticate, authorize(Role.ADMIN), validate(updateCouponSchema), updateCoupon);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteCoupon);

export default router;
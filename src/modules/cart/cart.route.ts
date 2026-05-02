import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  addToCart,
  applyCoupon,
  clearCart,
  getCart,
  removeCartItem,
  removeCoupon,
  updateCartItem,
} from "./cart.controller";
import {
  addToCartSchema,
  applyCouponSchema,
  updateCartItemSchema,
} from "./cart.validation";

const router = Router();

router.use(authenticate); // সব route এ auth required

router.get("/", getCart);
router.post("/items", validate(addToCartSchema), addToCart);
router.patch("/items/:itemId", validate(updateCartItemSchema), updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/clear", clearCart);
router.post("/apply-coupon", validate(applyCouponSchema), applyCoupon);
router.delete("/remove-coupon", removeCoupon);

export default router;
import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/category/category.route";
import brandRoutes from "../modules/brand/brand.route";
import tagRoutes from "../modules/tag/tag.route";
import productRoutes from "../modules/product/product.route";
import inventoryRoutes from "../modules/inventory/inventory.route";
import addressRoutes from "../modules/address/address.route";
import cartRoutes from "../modules/cart/cart.route";
import wishlistRoutes from "../modules/wishlist/wishlist.route";
import couponRoutes from "../modules/coupon/coupon.route";
import orderRoutes from "../modules/order/order.route";
import paymentRoutes from "../modules/payment/payment.route";
import shippingRoutes from "../modules/shipping/shipping.route";
import reviewRoutes from "../modules/review/review.route";
import bannerRoutes from "../modules/banner/banner.route";


const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/tags", tagRoutes);
router.use("/products", productRoutes);
router.use("/inventories", inventoryRoutes);
router.use("/addresses", addressRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/shipping", shippingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/banners", bannerRoutes);

export default router;

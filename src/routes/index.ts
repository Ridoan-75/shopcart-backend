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

export default router;
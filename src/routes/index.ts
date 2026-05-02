import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/category/category.route";
import brandRoutes from "../modules/brand/brand.route";
import tagRoutes from "../modules/tag/tag.route";
import productRoutes from "../modules/product/product.route";
import inventoryRoutes from "../modules/inventory/inventory.route";


const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/tags", tagRoutes);
router.use("/products", productRoutes);
router.use("/inventories", inventoryRoutes);

export default router;
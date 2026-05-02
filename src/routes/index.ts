import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/category/category.route";
import brandRoutes from "../modules/brand/brand.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);

export default router;
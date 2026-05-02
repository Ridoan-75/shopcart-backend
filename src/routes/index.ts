import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";

const router = Router();

router.use("/auth", authRoutes);

// Add more routes here as you build them
// router.use("/users", userRoutes);
// router.use("/products", productRoutes);

export default router;
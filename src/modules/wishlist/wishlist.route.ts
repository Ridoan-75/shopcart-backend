import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist } from "./wishlist.controller";

const router = Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.post("/toggle", toggleWishlist);

export default router;
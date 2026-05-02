import { Router } from "express";
import {
  getUserRecommendations,
  getSimilarProducts,
  getSearchSuggestions,
  getTrendingProducts,
  aiChat,
} from "./ai.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/similar/:productId", getSimilarProducts);
router.get("/search-suggestions", getSearchSuggestions);
router.get("/trending", getTrendingProducts);

// ─── Auth ──────────────────────────────────────────────────────────────────────
router.get("/recommendations/:userId", authenticate, getUserRecommendations);
router.post("/chat", authenticate, aiChat);

export default router;

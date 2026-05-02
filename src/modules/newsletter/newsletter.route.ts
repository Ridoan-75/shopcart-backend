import { Router } from "express";
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
} from "./newsletter.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { subscribeSchema } from "./newsletter.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.post("/subscribe", validate(subscribeSchema), subscribe);
router.get("/unsubscribe", unsubscribe);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get(
  "/subscribers",
  authenticate,
  authorize(Role.ADMIN),
  getAllSubscribers
);
router.delete(
  "/subscribers/:id",
  authenticate,
  authorize(Role.ADMIN),
  deleteSubscriber
);

export default router;
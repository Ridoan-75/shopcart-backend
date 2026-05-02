import { Router } from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  sendNotification,
  broadcastNotification,
} from "./notification.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../types/enum";

const router = Router();

// ─── Auth ──────────────────────────────────────────────────────────────────────
router.get("/", authenticate, getUserNotifications);
router.patch("/:id/read", authenticate, markAsRead);
router.patch("/read-all", authenticate, markAllAsRead);
router.delete("/clear-read", authenticate, deleteAllRead);
router.delete("/:id", authenticate, deleteNotification);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.post(
  "/send",
  authenticate,
  authorize(Role.ADMIN),
  sendNotification
);
router.post(
  "/broadcast",
  authenticate,
  authorize(Role.ADMIN),
  broadcastNotification
);

export default router;
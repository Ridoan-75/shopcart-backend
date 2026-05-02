import { Router } from "express";
import {
  createComment,
  getAllComments,
  approveComment,
  deleteComment,
} from "./blogComment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../types/enum";

const router = Router();

// ─── Auth ──────────────────────────────────────────────────────────────────────
router.post("/", authenticate, createComment);
router.delete("/:id", authenticate, deleteComment);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get("/", authenticate, authorize(Role.ADMIN), getAllComments);
router.patch("/:id/approve", authenticate, authorize(Role.ADMIN), approveComment);

export default router;
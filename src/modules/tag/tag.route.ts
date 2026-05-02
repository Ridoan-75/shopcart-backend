import { Router } from "express";
import {
  createTag,
  bulkCreateTag,
  getAllTags,
  getSingleTag,
  updateTag,
  deleteTag,
  bulkDeleteTag,
} from "./tag.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createTagSchema,
  updateTagSchema,
  bulkCreateTagSchema,
} from "./tag.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllTags);
router.get("/:slug", getSingleTag);

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.post("/", authenticate, authorize(Role.ADMIN), validate(createTagSchema), createTag);
router.post("/bulk", authenticate, authorize(Role.ADMIN), validate(bulkCreateTagSchema), bulkCreateTag);
router.patch("/:id", authenticate, authorize(Role.ADMIN), validate(updateTagSchema), updateTag);
router.delete("/bulk", authenticate, authorize(Role.ADMIN), bulkDeleteTag);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteTag);

export default router;
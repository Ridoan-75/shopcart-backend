import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getAllBlogsAdmin,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  toggleBlogFeatured,
} from "./blog.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createBlogSchema, updateBlogSchema } from "./blog.validation";
import { Role } from "../../types/enum";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllBlogs);
router.get("/:slug", getSingleBlog);

// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/all", authenticate, authorize(Role.ADMIN), getAllBlogsAdmin);
router.post("/", authenticate, authorize(Role.ADMIN), validate(createBlogSchema), createBlog);
router.patch("/:id", authenticate, authorize(Role.ADMIN), validate(updateBlogSchema), updateBlog);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteBlog);
router.patch("/:id/featured", authenticate, authorize(Role.ADMIN), toggleBlogFeatured);

export default router;
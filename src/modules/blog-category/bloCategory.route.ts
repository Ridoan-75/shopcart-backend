import { Router } from "express";
import {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory,
} from "./blogCategory.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createBlogCategorySchema,
  updateBlogCategorySchema,
} from "./blogCategory.validation";
import { Role } from "../../types/enum";

const router = Router();

router.get("/", getAllBlogCategories);
router.post("/", authenticate, authorize(Role.ADMIN), validate(createBlogCategorySchema), createBlogCategory);
router.patch("/:id", authenticate, authorize(Role.ADMIN), validate(updateBlogCategorySchema), updateBlogCategory);
router.delete("/:id", authenticate, authorize(Role.ADMIN), deleteBlogCategory);

export default router;
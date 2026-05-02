import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import { slugify } from "../../utils/slugify";

export const createBlogCategoryService = async (payload: {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}) => {
  const slug = slugify(payload.name);
  const existing = await prisma.blogCategory.findUnique({ where: { slug } });
  if (existing) throw new AppError("Blog category already exists", 409);

  return prisma.blogCategory.create({
    data: { ...payload, slug },
  });
};

export const getAllBlogCategoriesService = async () => {
  return prisma.blogCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { blogs: true } } },
  });
};

export const updateBlogCategoryService = async (
  id: string,
  payload: {
    name?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
  }
) => {
  const category = await prisma.blogCategory.findUnique({ where: { id } });
  if (!category) throw new AppError("Blog category not found", 404);

  const data: any = { ...payload };
  if (payload.name) {
    const slug = slugify(payload.name);
    const existing = await prisma.blogCategory.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) throw new AppError("Blog category already exists", 409);
    data.slug = slug;
  }

  return prisma.blogCategory.update({ where: { id }, data });
};

export const deleteBlogCategoryService = async (id: string) => {
  const category = await prisma.blogCategory.findUnique({
    where: { id },
    include: { _count: { select: { blogs: true } } },
  });
  if (!category) throw new AppError("Blog category not found", 404);
  if (category._count.blogs > 0)
    throw new AppError("Cannot delete category with blogs", 400);

  await prisma.blogCategory.delete({ where: { id } });
  return { message: "Blog category deleted successfully" };
};
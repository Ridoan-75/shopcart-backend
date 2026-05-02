import { db } from "../../config/db";
import { AppError } from "../../utils/apiError";
import { slugify } from "../../utils/slugify";

// ─── Create ────────────────────────────────────────────────────────────────────
export const createCategoryService = async (payload: {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}) => {
  const slug = slugify(payload.name);

  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) throw new AppError("Category with this name already exists", 409);

  if (payload.parentId) {
    const parent = await db.category.findUnique({
      where: { id: payload.parentId },
    });
    if (!parent) throw new AppError("Parent category not found", 404);
  }

  return db.category.create({
    data: { ...payload, slug },
    include: { parent: { select: { id: true, name: true, slug: true } } },
  });
};

// ─── Get All ───────────────────────────────────────────────────────────────────
export const getAllCategoriesService = async (query: {
  search?: string;
  isActive?: string;
  parentId?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  }

  if (query.parentId === "null") {
    where.parentId = null; // only root categories
  } else if (query.parentId) {
    where.parentId = query.parentId;
  }

  const [data, total] = await Promise.all([
    db.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true, isActive: true } },
        _count: { select: { products: true } },
      },
    }),
    db.category.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Get Tree (nested) ─────────────────────────────────────────────────────────
export const getCategoryTreeService = async () => {
  const categories = await db.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          children: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          },
        },
      },
    },
  });
  return categories;
};

// ─── Get Single ────────────────────────────────────────────────────────────────
export const getSingleCategoryService = async (slug: string) => {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, image: true },
      },
      _count: { select: { products: true } },
    },
  });
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

// ─── Update ────────────────────────────────────────────────────────────────────
export const updateCategoryService = async (
  id: string,
  payload: {
    name?: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
) => {
  const category = await db.category.findUnique({ where: { id } });
  if (!category) throw new AppError("Category not found", 404);

  // prevent setting itself as parent
  if (payload.parentId === id) {
    throw new AppError("Category cannot be its own parent", 400);
  }

  const data: any = { ...payload };

  if (payload.name) {
    const slug = slugify(payload.name);
    const existing = await db.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) throw new AppError("Category with this name already exists", 409);
    data.slug = slug;
  }

  return db.category.update({
    where: { id },
    data,
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
  });
};

// ─── Delete ────────────────────────────────────────────────────────────────────
export const deleteCategoryService = async (id: string) => {
  const category = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true, products: true } } },
  });
  if (!category) throw new AppError("Category not found", 404);

  if (category._count.children > 0) {
    throw new AppError("Cannot delete category with subcategories", 400);
  }
  if (category._count.products > 0) {
    throw new AppError("Cannot delete category with products", 400);
  }

  await db.category.delete({ where: { id } });
  return { message: "Category deleted successfully" };
};

// ─── Toggle Active ─────────────────────────────────────────────────────────────
export const toggleCategoryStatusService = async (id: string) => {
  const category = await db.category.findUnique({ where: { id } });
  if (!category) throw new AppError("Category not found", 404);

  return db.category.update({
    where: { id },
    data: { isActive: !category.isActive },
    select: { id: true, name: true, isActive: true },
  });
};
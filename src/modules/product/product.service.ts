import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import { slugify } from "../../utils/slugify";

// ─── Create ────────────────────────────────────────────────────────────────────
export const createProductService = async (payload: {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  categoryId: string;
  brandId?: string;
  images?: string[];
  thumbnail?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  weight?: number;
  dimensions?: object;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  tagIds?: string[];
  stock?: number;
  lowStockThreshold?: number;
}) => {
  const slug = slugify(payload.name);

  // check slug & sku unique
  const [slugExists, skuExists] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.product.findUnique({ where: { sku: payload.sku } }),
  ]);
  if (slugExists) throw new AppError("Product with this name already exists", 409);
  if (skuExists) throw new AppError("SKU already exists", 409);

  // check category
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) throw new AppError("Category not found", 404);

  // check brand
  if (payload.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: payload.brandId } });
    if (!brand) throw new AppError("Brand not found", 404);
  }

  const { tagIds, stock, lowStockThreshold, ...productData } = payload;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      // create inventory
      inventory: {
        create: {
          quantity: stock ?? 0,
          lowStockAlert: lowStockThreshold ?? 5,
        },
      },
      // connect tags
      tags: tagIds?.length
        ? {
            create: tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      inventory: true,
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });

  return product;
};

// ─── Get All ───────────────────────────────────────────────────────────────────
export const getAllProductsService = async (query: {
  search?: string;
  categoryId?: string;
  brandId?: string;
  tagId?: string;
  minPrice?: string;
  maxPrice?: string;
  isActive?: string;
  isFeatured?: string;
  isNewArrival?: string;
  isBestSeller?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.brandId) where.brandId = query.brandId;
  if (query.tagId) {
    where.tags = { some: { tagId: query.tagId } };
  }
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured === "true";
  if (query.isNewArrival !== undefined) where.isNewArrival = query.isNewArrival === "true";
  if (query.isBestSeller !== undefined) where.isBestSeller = query.isBestSeller === "true";

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        inventory: { select: { quantity: true, lowStockAlert: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get Single ────────────────────────────────────────────────────────────────
export const getSingleProductService = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      inventory: true,
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

// ─── Update ────────────────────────────────────────────────────────────────────
export const updateProductService = async (
  id: string,
  payload: {
    name?: string;
    description?: string;
    shortDescription?: string;
    sku?: string;
    price?: number;
    comparePrice?: number;
    costPrice?: number;
    categoryId?: string;
    brandId?: string;
    images?: string[];
    thumbnail?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    weight?: number;
    dimensions?: object;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    tagIds?: string[];
  }
) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);

  const { tagIds, ...productData } = payload;
  const data: any = { ...productData };

  if (payload.name) {
    const slug = slugify(payload.name);
    const existing = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) throw new AppError("Product with this name already exists", 409);
    data.slug = slug;
  }

  if (payload.sku) {
    const existing = await prisma.product.findFirst({
      where: { sku: payload.sku, NOT: { id } },
    });
    if (existing) throw new AppError("SKU already exists", 409);
  }

  // update tags — delete old, insert new
  if (tagIds !== undefined) {
    await prisma.productTag.deleteMany({ where: { productId: id } });
    if (tagIds.length > 0) {
      data.tags = {
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }
  }

  return prisma.product.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      inventory: true,
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });
};

// ─── Delete ────────────────────────────────────────────────────────────────────
export const deleteProductService = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);

  await prisma.product.delete({ where: { id } });
  return { message: "Product deleted successfully" };
};

// ─── Toggle Status ─────────────────────────────────────────────────────────────
export const toggleProductStatusService = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);

  return prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
    select: { id: true, name: true, isActive: true },
  });
};

// ─── Featured / NewArrival / BestSeller Toggle ─────────────────────────────────
export const toggleProductFlagService = async (
  id: string,
  flag: "isFeatured" | "isNewArrival" | "isBestSeller"
) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);

  return prisma.product.update({
    where: { id },
    data: { [flag]: !product[flag] },
    select: { id: true, name: true, [flag]: true },
  });
};

// ─── Related Products ──────────────────────────────────────────────────────────
export const getRelatedProductsService = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, categoryId: true },
  });
  if (!product) throw new AppError("Product not found", 404);

  return prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      NOT: { id: product.id },
    },
    take: 8,
    orderBy: { totalSold: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      inventory: { select: { quantity: true } },
    },
  });
};
import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import { slugify } from "../../utils/slugify";

// ─── Create ────────────────────────────────────────────────────────────────────
export const createBrandService = async (payload: {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
}) => {
  const slug = slugify(payload.name);

  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) throw new AppError("Brand with this name already exists", 409);

  return prisma.brand.create({
    data: { ...payload, slug },
  });
};

// ─── Get All ───────────────────────────────────────────────────────────────────
export const getAllBrandsService = async (query: {
  search?: string;
  isActive?: string;
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

  const [data, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.brand.count({ where }),
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

// ─── Get Single ────────────────────────────────────────────────────────────────
export const getSingleBrandService = async (slug: string) => {
  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: true } },
    },
  });
  if (!brand) throw new AppError("Brand not found", 404);
  return brand;
};

// ─── Update ────────────────────────────────────────────────────────────────────
export const updateBrandService = async (
  id: string,
  payload: {
    name?: string;
    description?: string;
    logo?: string;
    website?: string;
    isActive?: boolean;
  }
) => {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new AppError("Brand not found", 404);

  const data: any = { ...payload };

  if (payload.name) {
    const slug = slugify(payload.name);
    const existing = await prisma.brand.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) throw new AppError("Brand with this name already exists", 409);
    data.slug = slug;
  }

  return prisma.brand.update({
    where: { id },
    data,
  });
};

// ─── Delete ────────────────────────────────────────────────────────────────────
export const deleteBrandService = async (id: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!brand) throw new AppError("Brand not found", 404);

  if (brand._count.products > 0) {
    throw new AppError("Cannot delete brand with products", 400);
  }

  await prisma.brand.delete({ where: { id } });
  return { message: "Brand deleted successfully" };
};

// ─── Toggle Status ─────────────────────────────────────────────────────────────
export const toggleBrandStatusService = async (id: string) => {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new AppError("Brand not found", 404);

  return prisma.brand.update({
    where: { id },
    data: { isActive: !brand.isActive },
    select: { id: true, name: true, isActive: true },
  });
};
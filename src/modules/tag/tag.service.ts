import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import { slugify } from "../../utils/slugify";

// ─── Create ────────────────────────────────────────────────────────────────────
export const createTagService = async (name: string) => {
  const slug = slugify(name);

  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) throw new AppError("Tag with this name already exists", 409);

  return prisma.tag.create({
    data: { name, slug },
  });
};

// ─── Bulk Create ───────────────────────────────────────────────────────────────
export const bulkCreateTagService = async (names: string[]) => {
  const results = [];

  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    results.push(tag);
  }

  return results;
};

// ─── Get All ───────────────────────────────────────────────────────────────────
export const getAllTagsService = async (query: {
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  const [data, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.tag.count({ where }),
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
export const getSingleTagService = async (slug: string) => {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: true } },
    },
  });
  if (!tag) throw new AppError("Tag not found", 404);
  return tag;
};

// ─── Update ────────────────────────────────────────────────────────────────────
export const updateTagService = async (id: string, name: string) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) throw new AppError("Tag not found", 404);

  const slug = slugify(name);

  const existing = await prisma.tag.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) throw new AppError("Tag with this name already exists", 409);

  return prisma.tag.update({
    where: { id },
    data: { name, slug },
  });
};

// ─── Delete ────────────────────────────────────────────────────────────────────
export const deleteTagService = async (id: string) => {
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!tag) throw new AppError("Tag not found", 404);

  if (tag._count.products > 0) {
    throw new AppError("Cannot delete tag assigned to products", 400);
  }

  await prisma.tag.delete({ where: { id } });
  return { message: "Tag deleted successfully" };
};

// ─── Bulk Delete ───────────────────────────────────────────────────────────────
export const bulkDeleteTagService = async (ids: string[]) => {
  // only delete tags with no products
  await prisma.tag.deleteMany({
    where: {
      id: { in: ids },
      products: { none: {} },
    },
  });
  return { message: "Tags deleted successfully" };
};
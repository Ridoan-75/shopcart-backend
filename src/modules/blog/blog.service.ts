import {db} from "../../config/db"; 
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import { slugify } from "../../utils/slugify";
import type { BlogStatus } from "../../../generated/prisma/enums";

// ─── Create ────────────────────────────────────────────────────────────────────
export const createBlogService = async (
  authorId: string,
  payload: {
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    categoryId: string;
    status?: BlogStatus;
    isFeatured?: boolean;
    tags?: string[];
    readingTime?: number;
    metaTitle?: string;
    metaDescription?: string;
  }
) => {
  const slug = slugify(payload.title);
  const existing = await prisma.blog.findUnique({ where: { slug } });
  if (existing) throw new AppError("Blog with this title already exists", 409);

  const category = await prisma.blogCategory.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) throw new AppError("Blog category not found", 404);

  // auto calc reading time if not provided (~200 words per min)
  const wordCount = payload.content.split(/\s+/).length;
  const readingTime = payload.readingTime ?? Math.ceil(wordCount / 200);

  return prisma.blog.create({
    data: {
      ...payload,
      slug,
      authorId,
      readingTime,
      publishedAt: payload.status === "PUBLISHED" ? new Date() : null,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });
};

// ─── Get All Blogs (Public) ────────────────────────────────────────────────────
export const getAllBlogsService = async (query: {
  search?: string;
  categoryId?: string;
  tag?: string;
  isFeatured?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { status: "PUBLISHED" };

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { excerpt: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.tag) where.tags = { has: query.tag };
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured === "true";

  const [data, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get All Blogs (Admin) ─────────────────────────────────────────────────────
export const getAllBlogsAdminService = async (query: {
  search?: string;
  status?: BlogStatus;
  categoryId?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get Single Blog ───────────────────────────────────────────────────────────
export const getSingleBlogService = async (slug: string) => {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      comments: {
        where: { isApproved: true, parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          replies: {
            where: { isApproved: true },
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
        },
      },
      _count: { select: { comments: true } },
    },
  });
  if (!blog) throw new AppError("Blog not found", 404);
  if (blog.status !== "PUBLISHED") throw new AppError("Blog not found", 404);

  // increment views
  await prisma.blog.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });

  return blog;
};

// ─── Update Blog ───────────────────────────────────────────────────────────────
export const updateBlogService = async (
  id: string,
  payload: {
    title?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    categoryId?: string;
    status?: BlogStatus;
    isFeatured?: boolean;
    tags?: string[];
    readingTime?: number;
    metaTitle?: string;
    metaDescription?: string;
  }
) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError("Blog not found", 404);

  const data: any = { ...payload };

  if (payload.title) {
    const slug = slugify(payload.title);
    const existing = await prisma.blog.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) throw new AppError("Blog with this title already exists", 409);
    data.slug = slug;
  }

  // set publishedAt when publishing for first time
  if (payload.status === "PUBLISHED" && !blog.publishedAt) {
    data.publishedAt = new Date();
  }

  if (payload.content) {
    const wordCount = payload.content.split(/\s+/).length;
    data.readingTime = payload.readingTime ?? Math.ceil(wordCount / 200);
  }

  return prisma.blog.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });
};

// ─── Delete Blog ───────────────────────────────────────────────────────────────
export const deleteBlogService = async (id: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError("Blog not found", 404);

  await prisma.blog.delete({ where: { id } });
  return { message: "Blog deleted successfully" };
};

// ─── Toggle Featured ───────────────────────────────────────────────────────────
export const toggleBlogFeaturedService = async (id: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError("Blog not found", 404);

  return prisma.blog.update({
    where: { id },
    data: { isFeatured: !blog.isFeatured },
    select: { id: true, title: true, isFeatured: true },
  });
};
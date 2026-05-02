import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";

// ─── Create Comment ────────────────────────────────────────────────────────────
export const createCommentService = async (
  userId: string,
  payload: {
    blogId: string;
    body: string;
    parentId?: string;
  }
) => {
  const blog = await prisma.blog.findUnique({ where: { id: payload.blogId } });
  if (!blog) throw new AppError("Blog not found", 404);

  if (payload.parentId) {
    const parent = await prisma.blogComment.findUnique({
      where: { id: payload.parentId },
    });
    if (!parent) throw new AppError("Parent comment not found", 404);
  }

  return prisma.blogComment.create({
    data: { ...payload, userId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });
};

// ─── Get All Comments (Admin) ──────────────────────────────────────────────────
export const getAllCommentsService = async (query: {
  blogId?: string;
  isApproved?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.blogId) where.blogId = query.blogId;
  if (query.isApproved !== undefined)
    where.isApproved = query.isApproved === "true";

  const [data, total] = await Promise.all([
    prisma.blogComment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        blog: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.blogComment.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Approve Comment ───────────────────────────────────────────────────────────
export const approveCommentService = async (id: string) => {
  const comment = await prisma.blogComment.findUnique({ where: { id } });
  if (!comment) throw new AppError("Comment not found", 404);

  return prisma.blogComment.update({
    where: { id },
    data: { isApproved: !comment.isApproved },
    select: { id: true, isApproved: true },
  });
};

// ─── Delete Comment ────────────────────────────────────────────────────────────
export const deleteCommentService = async (
  id: string,
  userId: string,
  role: string
) => {
  const comment = await prisma.blogComment.findUnique({ where: { id } });
  if (!comment) throw new AppError("Comment not found", 404);
  if (role !== "ADMIN" && comment.userId !== userId)
    throw new AppError("Not authorized", 403);

  await prisma.blogComment.delete({ where: { id } });
  return { message: "Comment deleted successfully" };
};
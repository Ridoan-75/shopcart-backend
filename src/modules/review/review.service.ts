import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";

// ─── helpers ───────────────────────────────────────────────────────────────────
const recalcProductRating = async (productId: string) => {
  const result = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: result._avg.rating ?? 0,
      totalReviews: result._count.id,
    },
  });
};

// ─── Create ────────────────────────────────────────────────────────────────────
export const createReviewService = async (
  userId: string,
  payload: {
    productId: string;
    rating: number;
    title?: string;
    body: string;
    images?: string[];
  }
) => {
  // check product exists
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });
  if (!product) throw new AppError("Product not found", 404);

  // check duplicate review
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId: payload.productId } },
  });
  if (existing) throw new AppError("You have already reviewed this product", 409);

  // check if user has purchased this product (verified review)
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: payload.productId,
      order: { userId, status: "DELIVERED" },
    },
  });

  const review = await prisma.review.create({
    data: {
      ...payload,
      userId,
      isVerified: !!hasPurchased,
      isApproved: false,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  return review;
};

// ─── Get Product Reviews (Public) ─────────────────────────────────────────────
export const getProductReviewsService = async (
  productId: string,
  query: {
    rating?: string;
    isVerified?: string;
    sortBy?: string;
    page?: string;
    limit?: string;
  }
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { productId, isApproved: true };

  if (query.rating) where.rating = Number(query.rating);
  if (query.isVerified !== undefined) {
    where.isVerified = query.isVerified === "true";
  }

  const sortBy = query.sortBy || "createdAt";
  const sortMap: any = {
    createdAt: { createdAt: "desc" },
    rating: { rating: "desc" },
    helpful: { helpfulCount: "desc" },
  };

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortMap[sortBy] ?? { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  // rating breakdown
  const breakdown = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, isApproved: true },
    _count: { rating: true },
  });

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: breakdown.find((b) => b.rating === star)?._count.rating ?? 0,
  }));

  return {
    data,
    ratingBreakdown,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get All Reviews (Admin) ───────────────────────────────────────────────────
export const getAllReviewsService = async (query: {
  isApproved?: string;
  isVerified?: string;
  productId?: string;
  rating?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.isApproved !== undefined) where.isApproved = query.isApproved === "true";
  if (query.isVerified !== undefined) where.isVerified = query.isVerified === "true";
  if (query.productId) where.productId = query.productId;
  if (query.rating) where.rating = Number(query.rating);

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        product: { select: { id: true, name: true, slug: true, thumbnail: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Update Review (own) ───────────────────────────────────────────────────────
export const updateReviewService = async (
  id: string,
  userId: string,
  payload: {
    rating?: number;
    title?: string;
    body?: string;
    images?: string[];
  }
) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Review not found", 404);
  if (review.userId !== userId)
    throw new AppError("Not authorized to edit this review", 403);

  const updated = await prisma.review.update({
    where: { id },
    data: { ...payload, isApproved: false }, // re-approve after edit
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  await recalcProductRating(review.productId);
  return updated;
};

// ─── Delete Review (own or admin) ─────────────────────────────────────────────
export const deleteReviewService = async (id: string, userId: string, role: string) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Review not found", 404);
  if (role !== "ADMIN" && review.userId !== userId)
    throw new AppError("Not authorized to delete this review", 403);

  await prisma.review.delete({ where: { id } });
  await recalcProductRating(review.productId);

  return { message: "Review deleted successfully" };
};

// ─── Approve Review (Admin) ────────────────────────────────────────────────────
export const approveReviewService = async (id: string) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Review not found", 404);

  const updated = await prisma.review.update({
    where: { id },
    data: { isApproved: !review.isApproved },
    select: { id: true, isApproved: true, productId: true },
  });

  await recalcProductRating(review.productId);

  return updated;
};

// ─── Mark Helpful ──────────────────────────────────────────────────────────────
export const markHelpfulService = async (id: string) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Review not found", 404);

  return prisma.review.update({
    where: { id },
    data: { helpfulCount: { increment: 1 } },
    select: { id: true, helpfulCount: true },
  });
};
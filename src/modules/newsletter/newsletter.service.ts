import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import crypto from "crypto";

// ─── Subscribe ─────────────────────────────────────────────────────────────────
export const subscribeService = async (payload: {
  email: string;
  name?: string;
}) => {
  const existing = await prisma.newsletter.findUnique({
    where: { email: payload.email },
  });

  // already subscribed and active
  if (existing && existing.isActive) {
    throw new AppError("This email is already subscribed", 409);
  }

  const token = crypto.randomBytes(32).toString("hex");

  // re-subscribe if previously unsubscribed
  if (existing && !existing.isActive) {
    return prisma.newsletter.update({
      where: { email: payload.email },
      data: {
        name: payload.name,
        isActive: true,
        subscribedAt: new Date(),
        unsubscribedAt: null,
        token,
      },
      select: { id: true, email: true, name: true, subscribedAt: true },
    });
  }

  return prisma.newsletter.create({
    data: {
      email: payload.email,
      name: payload.name,
      token,
    },
    select: { id: true, email: true, name: true, subscribedAt: true },
  });
};

// ─── Unsubscribe ───────────────────────────────────────────────────────────────
export const unsubscribeService = async (token: string) => {
  if (!token) throw new AppError("Token is required", 400);

  const subscriber = await prisma.newsletter.findFirst({
    where: { token },
  });

  if (!subscriber) throw new AppError("Invalid unsubscribe token", 400);
  if (!subscriber.isActive) throw new AppError("Already unsubscribed", 400);

  await prisma.newsletter.update({
    where: { id: subscriber.id },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
      token: null,
    },
  });

  return { message: "Unsubscribed successfully" };
};

// ─── Get All Subscribers (Admin) ───────────────────────────────────────────────
export const getAllSubscribersService = async (query: {
  isActive?: string;
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  }

  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { name: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.newsletter.findMany({
      where,
      skip,
      take: limit,
      orderBy: { subscribedAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        subscribedAt: true,
        unsubscribedAt: true,
      },
    }),
    prisma.newsletter.count({ where }),
  ]);

  // stats
  const [totalActive, totalInactive] = await Promise.all([
    prisma.newsletter.count({ where: { isActive: true } }),
    prisma.newsletter.count({ where: { isActive: false } }),
  ]);

  return {
    data,
    stats: { totalActive, totalInactive, total: totalActive + totalInactive },
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Delete Subscriber (Admin) ─────────────────────────────────────────────────
export const deleteSubscriberService = async (id: string) => {
  const subscriber = await prisma.newsletter.findUnique({ where: { id } });
  if (!subscriber) throw new AppError("Subscriber not found", 404);

  await prisma.newsletter.delete({ where: { id } });
  return { message: "Subscriber deleted successfully" };
};
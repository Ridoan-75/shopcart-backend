import { db } from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import type { BannerPosition } from "../../../generated/prisma/enums";

// ─── Create ────────────────────────────────────────────────────────────────────
export const createBannerService = async (payload: {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  linkText?: string;
  position?: BannerPosition;
  isActive?: boolean;
  sortOrder?: number;
  startsAt?: string;
  endsAt?: string;
}) => {
  return prisma.banner.create({
    data: {
      ...payload,
      startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
      endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
    },
  });
};

// ─── Get Active Banners (Public) ───────────────────────────────────────────────
export const getActiveBannersService = async (query: { position?: BannerPosition }) => {
  const now = new Date();

  const where: any = {
    isActive: true,
    OR: [{ startsAt: null }, { startsAt: { lte: now } }],
    AND: [
      {
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
    ],
  };

  if (query.position) where.position = query.position;

  return prisma.banner.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
};

// ─── Get All Banners (Admin) ───────────────────────────────────────────────────
export const getAllBannersService = async (query: {
  position?: BannerPosition;
  isActive?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.position) where.position = query.position;
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  const [data, total] = await Promise.all([
    prisma.banner.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.banner.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Update ────────────────────────────────────────────────────────────────────
export const updateBannerService = async (
  id: string,
  payload: {
    title?: string;
    subtitle?: string;
    image?: string;
    mobileImage?: string;
    link?: string;
    linkText?: string;
    position?: BannerPosition;
    isActive?: boolean;
    sortOrder?: number;
    startsAt?: string;
    endsAt?: string;
  },
) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new AppError("Banner not found", 404);

  return prisma.banner.update({
    where: { id },
    data: {
      ...payload,
      startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
      endsAt: payload.endsAt ? new Date(payload.endsAt) : undefined,
    },
  });
};

// ─── Delete ────────────────────────────────────────────────────────────────────
export const deleteBannerService = async (id: string) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new AppError("Banner not found", 404);

  await prisma.banner.delete({ where: { id } });
  return { message: "Banner deleted successfully" };
};

// ─── Toggle Status ─────────────────────────────────────────────────────────────
export const toggleBannerStatusService = async (id: string) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new AppError("Banner not found", 404);

  return prisma.banner.update({
    where: { id },
    data: { isActive: !banner.isActive },
    select: { id: true, title: true, isActive: true },
  });
};

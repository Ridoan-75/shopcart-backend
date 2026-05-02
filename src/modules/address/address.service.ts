import {db}from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";

// ─── Create ────────────────────────────────────────────────────────────────────
export const createAddressService = async (
  userId: string,
  payload: {
    label?: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
  }
) => {
  // if new address is default, unset all others
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  // if this is the first address, auto set as default
  const count = await prisma.address.count({ where: { userId } });
  if (count === 0) payload.isDefault = true;

  return prisma.address.create({
    data: { ...payload, userId },
  });
};

// ─── Get All (by user) ─────────────────────────────────────────────────────────
export const getUserAddressesService = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

// ─── Get Single ────────────────────────────────────────────────────────────────
export const getSingleAddressService = async (
  id: string,
  userId: string
) => {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) throw new AppError("Address not found", 404);
  if (address.userId !== userId)
    throw new AppError("Not authorized to access this address", 403);
  return address;
};

// ─── Update ────────────────────────────────────────────────────────────────────
export const updateAddressService = async (
  id: string,
  userId: string,
  payload: {
    label?: string;
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
  }
) => {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) throw new AppError("Address not found", 404);
  if (address.userId !== userId)
    throw new AppError("Not authorized to update this address", 403);

  // if setting as default, unset all others first
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId, NOT: { id } },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id },
    data: payload,
  });
};

// ─── Delete ────────────────────────────────────────────────────────────────────
export const deleteAddressService = async (id: string, userId: string) => {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) throw new AppError("Address not found", 404);
  if (address.userId !== userId)
    throw new AppError("Not authorized to delete this address", 403);

  await prisma.address.delete({ where: { id } });

  // if deleted address was default, set latest as default
  if (address.isDefault) {
    const latest = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (latest) {
      await prisma.address.update({
        where: { id: latest.id },
        data: { isDefault: true },
      });
    }
  }

  return { message: "Address deleted successfully" };
};

// ─── Set Default ───────────────────────────────────────────────────────────────
export const setDefaultAddressService = async (id: string, userId: string) => {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) throw new AppError("Address not found", 404);
  if (address.userId !== userId)
    throw new AppError("Not authorized", 403);

  // unset all others
  await prisma.address.updateMany({
    where: { userId, NOT: { id } },
    data: { isDefault: false },
  });

  return prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });
};

// ─── Admin: Get All Addresses ──────────────────────────────────────────────────
export const getAllAddressesAdminService = async (query: {
  userId?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.userId) where.userId = query.userId;

  const [data, total] = await Promise.all([
    prisma.address.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.address.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
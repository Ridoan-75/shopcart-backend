import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";

// ─── Create Flash Sale ─────────────────────────────────────────────────────────
export const createFlashSaleService = async (payload: {
  title: string;
  description?: string;
  banner?: string;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
}) => {
  return prisma.flashSale.create({
    data: {
      ...payload,
      startsAt: new Date(payload.startsAt),
      endsAt: new Date(payload.endsAt),
    },
  });
};

// ─── Add Items to Flash Sale ───────────────────────────────────────────────────
export const addFlashSaleItemsService = async (
  flashSaleId: string,
  items: {
    productId: string;
    salePrice: number;
    stockLimit?: number;
  }[]
) => {
  const flashSale = await prisma.flashSale.findUnique({
    where: { id: flashSaleId },
  });
  if (!flashSale) throw new AppError("Flash sale not found", 404);

  const results = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { id: true, price: true, name: true },
    });
    if (!product) throw new AppError(`Product ${item.productId} not found`, 404);

    if (item.salePrice >= product.price) {
      throw new AppError(
        `Sale price must be less than original price for ${product.name}`,
        400
      );
    }

    const discountPercent =
      ((product.price - item.salePrice) / product.price) * 100;

    const flashSaleItem = await prisma.flashSaleItem.upsert({
      where: {
        flashSaleId_productId: {
          flashSaleId,
          productId: item.productId,
        },
      },
      update: {
        salePrice: item.salePrice,
        originalPrice: product.price,
        discountPercent: Math.round(discountPercent * 100) / 100,
        stockLimit: item.stockLimit,
      },
      create: {
        flashSaleId,
        productId: item.productId,
        salePrice: item.salePrice,
        originalPrice: product.price,
        discountPercent: Math.round(discountPercent * 100) / 100,
        stockLimit: item.stockLimit,
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, thumbnail: true },
        },
      },
    });

    results.push(flashSaleItem);
  }

  return results;
};

// ─── Get Active Flash Sales (Public) ──────────────────────────────────────────
export const getActiveFlashSalesService = async () => {
  const now = new Date();

  return prisma.flashSale.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { endsAt: "asc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnail: true,
              images: true,
              avgRating: true,
              totalReviews: true,
            },
          },
        },
      },
    },
  });
};

// ─── Get All Flash Sales (Admin) ───────────────────────────────────────────────
export const getAllFlashSalesService = async (query: {
  isActive?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  const now = new Date();

  const [data, total] = await Promise.all([
    prisma.flashSale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, thumbnail: true },
            },
          },
        },
      },
    }),
    prisma.flashSale.count({ where }),
  ]);

  // enrich with status
  const enriched = data.map((sale) => ({
    ...sale,
    status:
      now < sale.startsAt
        ? "UPCOMING"
        : now > sale.endsAt
        ? "ENDED"
        : "ACTIVE",
  }));

  return {
    data: enriched,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get Single Flash Sale ─────────────────────────────────────────────────────
export const getSingleFlashSaleService = async (id: string) => {
  const flashSale = await prisma.flashSale.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnail: true,
              images: true,
              avgRating: true,
              totalReviews: true,
              inventory: { select: { quantity: true } },
            },
          },
        },
      },
      _count: { select: { items: true } },
    },
  });
  if (!flashSale) throw new AppError("Flash sale not found", 404);
  return flashSale;
};

// ─── Update Flash Sale ─────────────────────────────────────────────────────────
export const updateFlashSaleService = async (
  id: string,
  payload: {
    title?: string;
    description?: string;
    banner?: string;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
  }
) => {
  const flashSale = await prisma.flashSale.findUnique({ where: { id } });
  if (!flashSale) throw new AppError("Flash sale not found", 404);

  const data: any = { ...payload };
  if (payload.startsAt) data.startsAt = new Date(payload.startsAt);
  if (payload.endsAt) data.endsAt = new Date(payload.endsAt);

  return prisma.flashSale.update({
    where: { id },
    data,
    include: { _count: { select: { items: true } } },
  });
};

// ─── Delete Flash Sale ─────────────────────────────────────────────────────────
export const deleteFlashSaleService = async (id: string) => {
  const flashSale = await prisma.flashSale.findUnique({ where: { id } });
  if (!flashSale) throw new AppError("Flash sale not found", 404);

  await prisma.flashSale.delete({ where: { id } });
  return { message: "Flash sale deleted successfully" };
};

// ─── Remove Item from Flash Sale ──────────────────────────────────────────────
export const removeFlashSaleItemService = async (
  flashSaleId: string,
  itemId: string
) => {
  const item = await prisma.flashSaleItem.findUnique({ where: { id: itemId } });
  if (!item) throw new AppError("Flash sale item not found", 404);
  if (item.flashSaleId !== flashSaleId)
    throw new AppError("Item does not belong to this flash sale", 400);

  await prisma.flashSaleItem.delete({ where: { id: itemId } });
  return { message: "Item removed from flash sale" };
};
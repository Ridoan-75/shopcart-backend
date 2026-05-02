import {db} from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";

// ─── Get By Product ────────────────────────────────────────────────────────────
export const getInventoryByProductService = async (productId: string) => {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          thumbnail: true,
        },
      },
    },
  });
  if (!inventory) throw new AppError("Inventory not found", 404);
  return inventory;
};

// ─── Get All Inventories ───────────────────────────────────────────────────────
export const getAllInventoriesService = async (query: {
  search?: string;
  lowStock?: string;
  outOfStock?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.outOfStock === "true") {
    where.quantity = 0;
  } else if (query.lowStock === "true") {
    where.quantity = { gt: 0 };
  }

  if (query.search) {
    where.product = {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
      ],
    };
  }

  const [data, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            thumbnail: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.inventory.count({ where }),
  ]);

  // manually flag low stock since prisma cant compare two fields
  const enriched = data.map((inv) => ({
    ...inv,
    stock: inv.quantity,
    lowStockThreshold: inv.lowStockAlert,
    isLowStock: inv.quantity > 0 && inv.quantity <= inv.lowStockAlert,
    isOutOfStock: inv.quantity === 0,
  }));

  return {
    data: enriched,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Update Inventory ──────────────────────────────────────────────────────────
export const updateInventoryService = async (
  productId: string,
  payload: {
    stock: number;
    lowStockThreshold?: number;
  }
) => {
  const inventory = await prisma.inventory.findUnique({ where: { productId } });
  if (!inventory) throw new AppError("Inventory not found", 404);

  const updateData: any = { quantity: payload.stock };
  if (payload.lowStockThreshold !== undefined) {
    updateData.lowStockAlert = payload.lowStockThreshold;
  }

  return prisma.inventory.update({
    where: { productId },
    data: updateData,
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
  });
};

// ─── Adjust Stock ──────────────────────────────────────────────────────────────
export const adjustStockService = async (
  productId: string,
  payload: {
    quantity: number;
    type: "INCREMENT" | "DECREMENT";
    reason?: string;
  }
) => {
  const inventory = await prisma.inventory.findUnique({ where: { productId } });
  if (!inventory) throw new AppError("Inventory not found", 404);

  if (payload.type === "DECREMENT") {
    if (inventory.quantity < payload.quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${inventory.quantity}`,
        400
      );
    }
  }

  const updatedInventory = await prisma.inventory.update({
    where: { productId },
    data: {
      quantity:
        payload.type === "INCREMENT"
          ? { increment: payload.quantity }
          : { decrement: payload.quantity },
    },
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
  });

  return {
    ...updatedInventory,
    stock: updatedInventory.quantity,
    lowStockThreshold: updatedInventory.lowStockAlert,
    isLowStock:
      updatedInventory.quantity > 0 &&
      updatedInventory.quantity <= updatedInventory.lowStockAlert,
    isOutOfStock: updatedInventory.quantity === 0,
  };
};

// ─── Low Stock Alert ───────────────────────────────────────────────────────────
export const getLowStockProductsService = async () => {
  const inventories = await prisma.inventory.findMany({
    where: { quantity: { gt: 0 } },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          thumbnail: true,
          isActive: true,
        },
      },
    },
  });

  const lowStock = inventories.filter(
    (inv) => inv.quantity <= inv.lowStockAlert
  );

  return lowStock.map((inv) => ({
    ...inv,
    stock: inv.quantity,
    lowStockThreshold: inv.lowStockAlert,
    isLowStock: true,
    isOutOfStock: inv.quantity === 0,
  }));
};

// ─── Out Of Stock ──────────────────────────────────────────────────────────────
export const getOutOfStockProductsService = async () => {
  const inventories = await prisma.inventory.findMany({
    where: { quantity: 0 },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          thumbnail: true,
          isActive: true,
        },
      },
    },
  });

  return inventories.map((inv) => ({
    ...inv,
    stock: inv.quantity,
    lowStockThreshold: inv.lowStockAlert,
    isOutOfStock: true,
  }));
};
import { db } from "../../config/db";
import { AppError } from "../../utils/apiError";
import { IAddToWishlist } from "./wishlist.interface";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  discountPrice: true,
  isActive: true,
  inventory: { select: { quantity: true } },
  images: true,
  category: {
    select: { id: true, name: true },
  },
};

const normalizeWishlistItem = (item: any) => ({
  ...item,
  product: {
    ...item.product,
    stock: item.product.inventory?.quantity ?? 0,
  },
});

export const getWishlistService = async (userId: string) => {
  const items = await db.wishlist.findMany({
    where: { userId },
    include: { product: { select: productSelect } },
    orderBy: { createdAt: "desc" },
  });

  return { items: items.map(normalizeWishlistItem), total: items.length };
};

export const addToWishlistService = async (userId: string, input: IAddToWishlist) => {
  const { productId } = input;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);
  if (!product.isActive) throw new AppError("Product is not available", 400);

  const existing = await db.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) throw new AppError("Product already in wishlist", 409);

  const item = await db.wishlist.create({
    data: { userId, productId },
    include: { product: { select: productSelect } },
  });

  return normalizeWishlistItem(item);
};

export const removeFromWishlistService = async (userId: string, productId: string) => {
  const item = await db.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (!item) throw new AppError("Product not found in wishlist", 404);

  await db.wishlist.delete({
    where: { userId_productId: { userId, productId } },
  });
};

export const toggleWishlistService = async (userId: string, input: IAddToWishlist) => {
  const { productId } = input;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);

  const existing = await db.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await db.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });
    return { added: false, message: "Removed from wishlist" };
  }

  await db.wishlist.create({ data: { userId, productId } });
  return { added: true, message: "Added to wishlist" };
};
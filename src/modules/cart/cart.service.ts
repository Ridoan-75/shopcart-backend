import { db } from "../../config/db";
import { AppError } from "../../utils/apiError";
import { IAddToCart, IApplyCoupon, IUpdateCartItem } from "./cart.interface";

// Helper: get or create cart
const getOrCreateCart = async (userId: string) => {
  const normalizeCart = (cart: any) => ({
    ...cart,
    items: cart.items.map((item: any) => ({
      ...item,
      product: {
        ...item.product,
        stock: item.product.inventory?.quantity ?? 0,
      },
    })),
  });

  let cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              isActive: true,
              inventory: { select: { quantity: true } },
            },
          },
        },
      },
      coupon: true,
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                isActive: true,
                inventory: { select: { quantity: true } },
              },
            },
          },
        },
        coupon: true,
      },
    });
  }

  return normalizeCart(cart);
};

// Helper: calculate cart totals
const calculateTotals = (
  items: { price: number; quantity: number }[],
  coupon: { discountType: string; discountValue: number } | null
) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;

  if (coupon) {
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  const total = subtotal - discount;
  return { subtotal, discount, total };
};

export const getCartService = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  const totals = calculateTotals(cart.items, cart.coupon as any);

  return { ...cart, ...totals };
};

export const addToCartService = async (userId: string, input: IAddToCart) => {
  const { productId, quantity } = input;

  const product = await db.product.findUnique({ where: { id: productId }, include: { inventory: true } });
  if (!product) throw new AppError("Product not found", 404);
  if (!product.isActive) throw new AppError("Product is not available", 400);
  const availableStock = product.inventory?.quantity ?? 0;
  if (availableStock < quantity) throw new AppError(`Only ${availableStock} items in stock`, 400);

  const cart = await getOrCreateCart(userId);

  const existingItem = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (availableStock < newQuantity) {
      throw new AppError(`Only ${availableStock} items in stock`, 400);
    }
    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      },
    });
  }

  return getCartService(userId);
};

export const updateCartItemService = async (
  userId: string,
  itemId: string,
  input: IUpdateCartItem
) => {
  const { quantity } = input;

  const cart = await db.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404);

  const item = await db.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: { include: { inventory: true } } },
  });
  if (!item) throw new AppError("Cart item not found", 404);
  const availableStock = item.product.inventory?.quantity ?? 0;
  if (availableStock < quantity) {
    throw new AppError(`Only ${availableStock} items in stock`, 400);
  }

  await db.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCartService(userId);
};

export const removeCartItemService = async (userId: string, itemId: string) => {
  const cart = await db.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404);

  const item = await db.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) throw new AppError("Cart item not found", 404);

  await db.cartItem.delete({ where: { id: itemId } });

  return getCartService(userId);
};

export const clearCartService = async (userId: string) => {
  const cart = await db.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404);

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  await db.cart.update({ where: { id: cart.id }, data: { couponId: null } });

  return getCartService(userId);
};

export const applyCouponService = async (userId: string, input: IApplyCoupon) => {
  const { code } = input;

  const cart = await db.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart) throw new AppError("Cart not found", 404);
  if (cart.items.length === 0) throw new AppError("Cart is empty", 400);

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) throw new AppError("Invalid coupon code", 404);
  if (!coupon.isActive) throw new AppError("Coupon is not active", 400);
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError("Coupon has expired", 400);
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit reached", 400);
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount is ${coupon.minOrderAmount} to use this coupon`,
      400
    );
  }

  await db.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });

  return getCartService(userId);
};

export const removeCouponService = async (userId: string) => {
  const cart = await db.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404);

  await db.cart.update({ where: { id: cart.id }, data: { couponId: null } });

  return getCartService(userId);
};
export interface IAddToCart {
  productId: string;
  quantity: number;
}

export interface IUpdateCartItem {
  quantity: number;
}

export interface IApplyCoupon {
  code: string;
}

export interface ICartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    stock: number;
    images: { url: string; isPrimary: boolean }[];
  };
}

export interface ICartResponse {
  id: string;
  userId: string;
  couponId: string | null;
  items: ICartItemWithProduct[];
  coupon: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
  summary: {
    subtotal: number;
    discount: number;
    total: number;
    totalItems: number;
  };
}
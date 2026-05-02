export interface IAddToWishlist {
  productId: string;
}

export interface IWishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    stock: number;
    isActive: boolean;
    images: { url: string; isPrimary: boolean }[];
    category: {
      id: string;
      name: string;
    };
  };
}

export interface IWishlistResponse {
  items: IWishlistItem[];
  total: number;
}

export interface IToggleWishlistResponse {
  added: boolean;
  message: string;
}
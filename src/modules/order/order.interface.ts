import { OrderStatus } from "@prisma/client";

export interface IPlaceOrder {
  addressId: string;
  couponCode?: string;
  notes?: string;
  shippingCharge?: number;
  tax?: number;
}

export interface IUpdateOrderStatus {
  status: OrderStatus;
}

export interface IOrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface IOrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string | null;
  couponId: string | null;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: IOrderItemResponse[];
  address: {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  } | null;
  coupon: {
    id: string;
    code: string;
    type: string;
    value: number;
  } | null;
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
  } | null;
}
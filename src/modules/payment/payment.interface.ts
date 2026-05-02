import type { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums";

export interface ICreatePaymentSession {
  orderId: string;
  currency?: string;
  method?: PaymentMethod;
}

export interface IPaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface IPaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  stripePaymentId: string | null;
  stripeSessionId: string | null;
  receiptUrl: string | null;
  failureReason: string | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}
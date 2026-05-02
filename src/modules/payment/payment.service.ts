import { db } from "../../config/db";
import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import { AppError } from "../../utils/apiError";
import { PaymentStatus, PaymentMethod } from "@prisma/client";
import { ICreatePaymentSession, IPaymentFilters } from "./payment.interface";

const paymentInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
};

export const createPaymentSessionService = async (
  userId: string,
  input: ICreatePaymentSession
) => {
  const { orderId, currency = "usd", method = "STRIPE" } = input;

  // Order check
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) throw new AppError("Order not found", 404);
  if (order.status === "CANCELLED") throw new AppError("Order is cancelled", 400);

  // Existing payment check
  const existingPayment = await db.payment.findUnique({ where: { orderId } });
  if (existingPayment && existingPayment.status === PaymentStatus.PAID) {
    throw new AppError("Order is already paid", 400);
  }

  // Create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: order.user.email,
    line_items: order.items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.productName,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId,
    },
    success_url: `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/payment/cancel?orderId=${order.id}`,
  });

  // Upsert payment record
  const payment = await db.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      amount: order.total,
      currency,
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.PENDING,
      stripeSessionId: session.id,
    },
    update: {
      stripeSessionId: session.id,
      status: PaymentStatus.PENDING,
    },
    include: paymentInclude,
  });

  return { payment, sessionUrl: session.url, sessionId: session.id };
};

export const handleStripeWebhookService = async (
  rawBody: Buffer,
  signature: string
) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret
    );
  } catch {
    throw new AppError("Invalid webhook signature", 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      if (!orderId) break;

      await db.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId },
          data: {
            status: PaymentStatus.PAID,
            stripePaymentId: session.payment_intent,
            paidAt: new Date(),
            metadata: session,
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
        });
      });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      if (!orderId) break;

      await db.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.FAILED, failureReason: "Checkout session expired" },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as any;
      const paymentIntentId = charge.payment_intent;

      const paymentWhere = {
        stripePaymentId: paymentIntentId,
      } as any;

      const paymentData = {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundAmount: charge.amount_refunded / 100,
      } as any;

      await db.payment.updateMany({
        where: paymentWhere,
        data: paymentData,
      });
      break;
    }

    default:
      break;
  }

  return { received: true };
};

export const getPaymentByOrderIdService = async (
  userId: string,
  orderId: string
) => {
  const payment = await db.payment.findFirst({
    where: {
      orderId,
      order: { userId },
    },
    include: paymentInclude,
  });
  if (!payment) throw new AppError("Payment not found", 404);
  return payment;
};

export const getAllPaymentsAdminService = async (filters: IPaymentFilters) => {
  const { page = 1, limit = 10, status, method, startDate, endDate } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (method) where.method = method;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.payment.count({ where }),
  ]);

  return {
    payments,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};
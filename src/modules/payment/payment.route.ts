import { Router } from "express";
import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../types/enum"

import {
  createPaymentSession,
  getAllPaymentsAdmin,
  getPaymentByOrderId,
  stripeWebhook,
} from "./payment.controller";

const router = Router();

// Webhook — raw body লাগবে, তাই আলাদা
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Auth routes
router.post("/create-session", authenticate, createPaymentSession);
router.get("/:orderId", authenticate, getPaymentByOrderId);

// Admin routes
router.get("/", authenticate, authorize(Role.ADMIN), getAllPaymentsAdmin);

export default router;
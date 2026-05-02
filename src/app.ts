import express, { Application, Request, Response } from "express";
import cors from "cors";
import passport from "./config/passport";
import cookieParser from "cookie-parser";
import router from "./routes";
import dotenv from "dotenv";
import { globalErrorHandler, notFound } from "./middlewares/error.middleware";

dotenv.config();
const app: Application = express();

// Stripe Webhook - raw body before other middlewares
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// CORS
app.use(
  cors({
    origin: [
      "https://your-frontend.vercel.app", // production frontend URL
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "ShopCart API is running 🛒",
  });
});

// Application routes
app.use("/api", router);

// 404
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
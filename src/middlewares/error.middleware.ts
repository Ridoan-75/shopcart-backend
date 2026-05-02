import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/apiError";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ success: false, message: "Invalid token", data: null });
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json({ success: false, message: "Token expired", data: null });
    return;
  }

  // Prisma unique constraint
  if ((err as any).code === "P2002") {
    res.status(409).json({ success: false, message: "Duplicate entry", data: null });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  });
};

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
};
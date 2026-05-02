import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateToken";
import { AppError } from "../utils/apiError";
import { db } from "../config/db";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user) throw new AppError("User not found", 401);
    if (!user.isActive) throw new AppError("Account is inactive", 403);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
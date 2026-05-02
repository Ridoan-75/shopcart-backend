import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/apiError";
import { Role } from "../types/enum";

export const authorize =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }
    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
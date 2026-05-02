import { Response } from "express";

interface IMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  meta?: IMeta
): void => {
  res.status(statusCode).json({
    success,
    message,
    data: data ?? null,
    meta: meta ?? null,
  });
};
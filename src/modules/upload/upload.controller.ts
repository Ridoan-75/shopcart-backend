import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  uploadSingleImageService,
  uploadMultipleImagesService,
  deleteImageService,
  getAllUploadsService,
} from "./upload.service";
import { uploadSingle, uploadMultiple } from "../../middlewares/upload.middleware";

// ─── Single Image ──────────────────────────────────────────────────────────────
export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
  uploadSingle(req, res, async (err) => {
    if (err) return next(err);
    try {
      const folder = req.query.folder as string;
      const result = await uploadSingleImageService(
        req.file!,
        req.user!.id,
        folder
      );
      sendResponse(res, 201, true, "Image uploaded", result);
    } catch (error) {
      next(error);
    }
  });
};

// ─── Multiple Images ───────────────────────────────────────────────────────────
export const uploadImages = (req: Request, res: Response, next: NextFunction) => {
  uploadMultiple(req, res, async (err) => {
    if (err) return next(err);
    try {
      const folder = req.query.folder as string;
      const result = await uploadMultipleImagesService(
        req.files as Express.Multer.File[],
        req.user!.id,
        folder
      );
      sendResponse(res, 201, true, "Images uploaded", result);
    } catch (error) {
      next(error);
    }
  });
};

// ─── Delete Image ──────────────────────────────────────────────────────────────
export const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteImageService(req.params.publicId as string);
  sendResponse(res, 200, true, result.message);
});

// ─── Get All Uploads ───────────────────────────────────────────────────────────
export const getAllUploads = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllUploadsService(req.query as any);
  sendResponse(res, 200, true, "Uploads fetched", result.data, result.meta);
});
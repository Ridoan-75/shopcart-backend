import {db}from "../../config/db";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/apiError";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../utils/fileUpload";

// ─── Upload Single Image ───────────────────────────────────────────────────────
export const uploadSingleImageService = async (
  file: Express.Multer.File,
  userId: string,
  folder?: string
) => {
  if (!file) throw new AppError("No file provided", 400);

  const uploadFolder = folder || "shopcart/general";
  const result = await uploadToCloudinary(file.buffer, uploadFolder);

  const upload = await prisma.upload.create({
    data: {
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      resourceType: "image",
      size: result.size,
      width: result.width,
      height: result.height,
      folder: result.folder,
      uploadedBy: userId,
    },
  });

  return upload;
};

// ─── Upload Multiple Images ────────────────────────────────────────────────────
export const uploadMultipleImagesService = async (
  files: Express.Multer.File[],
  userId: string,
  folder?: string
) => {
  if (!files || files.length === 0) throw new AppError("No files provided", 400);

  const uploadFolder = folder || "shopcart/general";

  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, uploadFolder)
  );

  const results = await Promise.all(uploadPromises);

  const uploads = await prisma.upload.createMany({
    data: results.map((result) => ({
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      resourceType: "image",
      size: result.size,
      width: result.width,
      height: result.height,
      folder: result.folder,
      uploadedBy: userId,
    })),
  });

  // return full records
  const savedUploads = await prisma.upload.findMany({
    where: { publicId: { in: results.map((r) => r.publicId) } },
    orderBy: { createdAt: "desc" },
  });

  return savedUploads;
};

// ─── Delete Image ──────────────────────────────────────────────────────────────
export const deleteImageService = async (publicId: string) => {
  // decode because publicId in URL might be encoded (e.g. shopcart%2Fimage)
  const decoded = decodeURIComponent(publicId);

  const upload = await prisma.upload.findUnique({
    where: { publicId: decoded },
  });
  if (!upload) throw new AppError("Upload not found", 404);

  await deleteFromCloudinary(decoded);
  await prisma.upload.delete({ where: { publicId: decoded } });

  return { message: "Image deleted successfully" };
};

// ─── Get All Uploads (Admin) ───────────────────────────────────────────────────
export const getAllUploadsService = async (query: {
  folder?: string;
  uploadedBy?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.folder) where.folder = { contains: query.folder };
  if (query.uploadedBy) where.uploadedBy = query.uploadedBy;

  const [data, total] = await Promise.all([
    prisma.upload.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.upload.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
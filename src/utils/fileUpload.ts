import cloudinary from "../config/cloudinary";
import { AppError } from "./apiError";

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder = "shopcart",
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{
  url: string;
  publicId: string;
  format: string;
  size: number;
  width: number;
  height: number;
  folder: string;
}> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          return reject(new AppError("Cloudinary upload failed", 500));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          size: result.bytes,
          width: result.width,
          height: result.height,
          folder,
        });
      }
    );
    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError("Failed to delete image from Cloudinary", 500);
  }
};
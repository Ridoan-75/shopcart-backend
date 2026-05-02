import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    shortDescription: z.string().optional(),
    sku: z.string().min(1, "SKU is required"),
    price: z.number().positive("Price must be positive"),
    comparePrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    categoryId: z.string().min(1, "Category is required"),
    brandId: z.string().optional(),
    images: z.array(z.string()).optional().default([]),
    thumbnail: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    isNewArrival: z.boolean().optional().default(false),
    isBestSeller: z.boolean().optional().default(false),
    weight: z.number().positive().optional(),
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).optional().default([]),
    tagIds: z.array(z.string()).optional().default([]),
    // inventory
    stock: z.number().int().min(0).optional().default(0),
    lowStockThreshold: z.number().int().min(0).optional().default(5),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    shortDescription: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().positive().optional(),
    comparePrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    images: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    weight: z.number().positive().optional(),
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    tagId: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    isActive: z.string().optional(),
    isFeatured: z.string().optional(),
    isNewArrival: z.string().optional(),
    isBestSeller: z.string().optional(),
    sortBy: z.enum(["price", "createdAt", "avgRating", "totalSold"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
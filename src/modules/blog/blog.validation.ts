import { z } from "zod";

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    excerpt: z.string().optional(),
    content: z.string().min(50, "Content must be at least 50 characters"),
    coverImage: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
    isFeatured: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
    readingTime: z.number().int().positive().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    excerpt: z.string().optional(),
    content: z.string().min(50).optional(),
    coverImage: z.string().optional(),
    categoryId: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    readingTime: z.number().int().positive().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});
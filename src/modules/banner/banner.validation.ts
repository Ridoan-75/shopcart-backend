import { z } from "zod";

export const createBannerSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    subtitle: z.string().optional(),
    image: z.string().min(1, "Image is required"),
    mobileImage: z.string().optional(),
    link: z.string().optional(),
    linkText: z.string().optional(),
    position: z
      .enum(["HERO", "SIDEBAR", "POPUP", "TOP_BAR", "CATEGORY", "PROMOTIONAL"])
      .optional()
      .default("HERO"),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
  }),
});

export const updateBannerSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    subtitle: z.string().optional(),
    image: z.string().optional(),
    mobileImage: z.string().optional(),
    link: z.string().optional(),
    linkText: z.string().optional(),
    position: z
      .enum(["HERO", "SIDEBAR", "POPUP", "TOP_BAR", "CATEGORY", "PROMOTIONAL"])
      .optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
  }),
});
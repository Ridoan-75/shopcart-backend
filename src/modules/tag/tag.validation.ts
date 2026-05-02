import { z } from "zod";

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
  }),
});

export const updateTagSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
  }),
});

export const bulkCreateTagSchema = z.object({
  body: z.object({
    names: z.array(z.string().min(2)).min(1, "At least 1 tag required"),
  }),
});
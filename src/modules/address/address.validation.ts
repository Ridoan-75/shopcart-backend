import { z } from "zod";

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z.string().min(6, "Invalid phone number"),
    street: z.string().min(3, "Street is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    postalCode: z.string().min(2, "Postal code is required"),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    fullName: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    street: z.string().min(3).optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    postalCode: z.string().min(2).optional(),
    isDefault: z.boolean().optional(),
  }),
});
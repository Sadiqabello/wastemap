import { z } from "zod";

export const reportSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  category: z.enum([
    "household",
    "industrial",
    "hazardous",
    "electronic",
    "construction",
    "medical",
    "organic",
    "other",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  latitude: z.number().min(4.27, "Location must be within Nigeria").max(13.89, "Location must be within Nigeria"),
  longitude: z.number().min(2.67, "Location must be within Nigeria").max(14.68, "Location must be within Nigeria"),
  address: z.string().optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;

import { z } from "zod";

export const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.enum(["reporter", "authority", "admin"]),
});

export const adjustPointsSchema = z.object({
  userId: z.string().uuid(),
  points: z.number().int().min(-10000).max(10000),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(200),
});

export const bulkUpdateStatusSchema = z.object({
  reportIds: z.array(z.string().uuid()).min(1),
  newStatus: z.enum([
    "reported",
    "acknowledged",
    "cleanup_scheduled",
    "in_progress",
    "resolved",
  ]),
});

export const updateEventStatusSchema = z.object({
  eventId: z.string().uuid(),
  newStatus: z.enum(["upcoming", "in_progress", "completed", "cancelled"]),
});

export const deleteItemSchema = z.object({
  id: z.string().uuid(),
});

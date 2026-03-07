import { z } from "zod";

export const redeemRewardSchema = z.object({
  rewardId: z.string().uuid(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  accountNumber: z.string().optional(),
  bankCode: z.string().optional(),
  accountName: z.string().optional(),
});

export const createRewardSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["airtime", "data", "bank_transfer", "gift_card", "utility", "merchandise"]),
  point_cost: z.number().int().min(1),
  provider: z.string().default("manual"),
  is_active: z.boolean().default(true),
  stock: z.number().int().min(0).nullable().optional(),
  tier_required: z.enum(["green_starter", "eco_warrior", "clean_champion", "waste_hero"]).nullable().optional(),
});

export const createChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  action_type: z.string().min(1),
  target_count: z.number().int().min(1),
  bonus_points: z.number().int().min(1),
  start_date: z.string(),
  end_date: z.string(),
});

export type RedeemRewardData = z.infer<typeof redeemRewardSchema>;
export type CreateRewardData = z.infer<typeof createRewardSchema>;
export type CreateChallengeData = z.infer<typeof createChallengeSchema>;

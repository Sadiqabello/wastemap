-- Allow dynamic redemptions without a fixed reward catalog entry
ALTER TABLE public.redemptions ALTER COLUMN reward_id DROP NOT NULL;

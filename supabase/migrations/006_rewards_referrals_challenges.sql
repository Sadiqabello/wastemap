-- ============================================================
-- Rewards, Referrals, Challenges & Tier System Migration
-- ============================================================

-- ── Enums ───────────────────────────────────────────────────

CREATE TYPE public.reward_category AS ENUM (
  'airtime', 'data', 'bank_transfer', 'gift_card', 'utility', 'merchandise'
);

CREATE TYPE public.redemption_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded'
);

CREATE TYPE public.referral_status AS ENUM (
  'signed_up', 'first_report', 'first_event'
);

CREATE TYPE public.user_tier AS ENUM (
  'green_starter', 'eco_warrior', 'clean_champion', 'waste_hero'
);

-- ── Add tier column to profiles ─────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN tier public.user_tier NOT NULL DEFAULT 'green_starter';

ALTER TABLE public.profiles
  ADD COLUMN referral_code TEXT UNIQUE;

ALTER TABLE public.profiles
  ADD COLUMN referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN phone_number TEXT;

-- ── Rewards catalog ─────────────────────────────────────────

CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category public.reward_category NOT NULL,
  point_cost INTEGER NOT NULL CHECK (point_cost > 0),
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  stock INTEGER, -- NULL means unlimited
  tier_required public.user_tier,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rewards_active ON public.rewards(is_active) WHERE is_active = true;
CREATE INDEX idx_rewards_category ON public.rewards(category);

-- ── Redemptions ─────────────────────────────────────────────

CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status public.redemption_status NOT NULL DEFAULT 'pending',
  provider_reference TEXT,
  delivery_details JSONB DEFAULT '{}',
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_redemptions_user ON public.redemptions(user_id);
CREATE INDEX idx_redemptions_status ON public.redemptions(status);

-- ── Referrals ───────────────────────────────────────────────

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'signed_up',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referrer_id, referred_id)
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);

-- ── Challenges ──────────────────────────────────────────────

CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL, -- matches point action types or custom
  target_count INTEGER NOT NULL CHECK (target_count > 0),
  bonus_points INTEGER NOT NULL CHECK (bonus_points > 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE INDEX idx_challenges_active ON public.challenges(is_active, start_date, end_date);

-- ── User challenge progress ─────────────────────────────────

CREATE TABLE public.user_challenges (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
);

-- ── Atomic reward redemption function ───────────────────────

CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_user_id UUID,
  p_reward_id UUID,
  p_delivery_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward RECORD;
  v_profile RECORD;
  v_redemption_id UUID;
  v_tier_order INTEGER;
  v_user_tier_order INTEGER;
BEGIN
  -- Get reward details (lock row to prevent overselling)
  SELECT * INTO v_reward FROM public.rewards WHERE id = p_reward_id AND is_active = true FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;

  -- Check stock
  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RAISE EXCEPTION 'Reward out of stock';
  END IF;

  -- Get user profile (lock for point deduction)
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check sufficient points
  IF v_profile.points < v_reward.point_cost THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Check tier requirement
  IF v_reward.tier_required IS NOT NULL THEN
    SELECT CASE v_reward.tier_required
      WHEN 'green_starter' THEN 0
      WHEN 'eco_warrior' THEN 1
      WHEN 'clean_champion' THEN 2
      WHEN 'waste_hero' THEN 3
    END INTO v_tier_order;

    SELECT CASE v_profile.tier
      WHEN 'green_starter' THEN 0
      WHEN 'eco_warrior' THEN 1
      WHEN 'clean_champion' THEN 2
      WHEN 'waste_hero' THEN 3
    END INTO v_user_tier_order;

    IF v_user_tier_order < v_tier_order THEN
      RAISE EXCEPTION 'Tier requirement not met';
    END IF;
  END IF;

  -- Deduct points
  UPDATE public.profiles
  SET points = points - v_reward.point_cost
  WHERE id = p_user_id;

  -- Decrement stock if applicable
  IF v_reward.stock IS NOT NULL THEN
    UPDATE public.rewards
    SET stock = stock - 1
    WHERE id = p_reward_id;
  END IF;

  -- Log as a point transaction (negative)
  INSERT INTO public.point_transactions (user_id, action, points)
  VALUES (p_user_id, 'reward_redeemed', -v_reward.point_cost);

  -- Create redemption record
  INSERT INTO public.redemptions (user_id, reward_id, points_spent, delivery_details)
  VALUES (p_user_id, p_reward_id, v_reward.point_cost, p_delivery_details)
  RETURNING id INTO v_redemption_id;

  RETURN v_redemption_id;
END;
$$;

-- ── Tier update function (call after points change) ─────────

CREATE OR REPLACE FUNCTION public.update_user_tier(p_user_id UUID)
RETURNS public.user_tier
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INTEGER;
  v_new_tier public.user_tier;
BEGIN
  SELECT points INTO v_points FROM public.profiles WHERE id = p_user_id;

  v_new_tier := CASE
    WHEN v_points >= 2000 THEN 'waste_hero'::public.user_tier
    WHEN v_points >= 500 THEN 'clean_champion'::public.user_tier
    WHEN v_points >= 100 THEN 'eco_warrior'::public.user_tier
    ELSE 'green_starter'::public.user_tier
  END;

  UPDATE public.profiles SET tier = v_new_tier WHERE id = p_user_id;

  RETURN v_new_tier;
END;
$$;

-- ── Auto-update tier after points change via trigger ────────

CREATE OR REPLACE FUNCTION public.trigger_update_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.points IS DISTINCT FROM OLD.points THEN
    PERFORM public.update_user_tier(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_tier
  AFTER UPDATE OF points ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_tier();

-- ── Generate referral code for existing users ───────────────

CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO v_code FROM public.profiles WHERE id = p_user_id;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  -- Generate a unique 8-character code
  LOOP
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    BEGIN
      UPDATE public.profiles SET referral_code = v_code WHERE id = p_user_id;
      RETURN v_code;
    EXCEPTION WHEN unique_violation THEN
      -- Retry with new code
    END;
  END LOOP;
END;
$$;

-- ── RLS Policies ────────────────────────────────────────────

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Rewards: everyone can view active rewards
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (is_active = true);

-- Rewards: admins can manage
CREATE POLICY "Admins can manage rewards"
  ON public.rewards FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Redemptions: users can view own
CREATE POLICY "Users can view own redemptions"
  ON public.redemptions FOR SELECT
  USING (user_id = auth.uid());

-- Redemptions: admins can view all
CREATE POLICY "Admins can view all redemptions"
  ON public.redemptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Redemptions: admins can update
CREATE POLICY "Admins can update redemptions"
  ON public.redemptions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Referrals: users can view own (as referrer or referred)
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Challenges: everyone can view active
CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  USING (is_active = true);

-- Challenges: admins can manage
CREATE POLICY "Admins can manage challenges"
  ON public.challenges FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User challenges: users can view own
CREATE POLICY "Users can view own challenge progress"
  ON public.user_challenges FOR SELECT
  USING (user_id = auth.uid());

-- User challenges: users can insert/update own
CREATE POLICY "Users can track own challenge progress"
  ON public.user_challenges FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challenge progress"
  ON public.user_challenges FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can view all user challenges
CREATE POLICY "Admins can view all challenge progress"
  ON public.user_challenges FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

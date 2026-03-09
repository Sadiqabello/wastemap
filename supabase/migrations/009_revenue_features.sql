-- ============================================================
-- Migration 009: Revenue Generation Features
-- Adds: collector marketplace, sponsorships, carbon tracking,
--        achievements, premium subscriptions, platform fees
-- ============================================================

-- ── New Enums ────────────────────────────────────────────────

CREATE TYPE public.collector_status AS ENUM ('pending', 'verified', 'suspended');
CREATE TYPE public.bid_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
CREATE TYPE public.sponsorship_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');

-- ── Collector Profiles ───────────────────────────────────────

CREATE TABLE public.collector_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_registration TEXT,
  description TEXT,
  waste_categories TEXT[] NOT NULL DEFAULT '{}',
  service_area_radius INTEGER NOT NULL DEFAULT 10, -- km
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  phone TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  total_pickups INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0, -- in Naira
  status public.collector_status DEFAULT 'pending',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.collector_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collector profiles are viewable by everyone"
  ON public.collector_profiles FOR SELECT USING (true);

CREATE POLICY "Users can create their own collector profile"
  ON public.collector_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collector profile"
  ON public.collector_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage collector profiles"
  ON public.collector_profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Pickup Bids ──────────────────────────────────────────────

CREATE TABLE public.pickup_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_amount INTEGER NOT NULL, -- in Naira
  estimated_time TEXT, -- e.g. "2 hours", "same day"
  notes TEXT,
  status public.bid_status DEFAULT 'pending',
  platform_fee INTEGER DEFAULT 0, -- calculated on acceptance
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id, collector_id)
);

ALTER TABLE public.pickup_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bids viewable by report owner and collector"
  ON public.pickup_bids FOR SELECT
  USING (
    auth.uid() = collector_id
    OR auth.uid() IN (SELECT user_id FROM public.reports WHERE id = report_id)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Collectors can create bids"
  ON public.pickup_bids FOR INSERT
  WITH CHECK (auth.uid() = collector_id);

CREATE POLICY "Bid participants can update"
  ON public.pickup_bids FOR UPDATE
  USING (
    auth.uid() = collector_id
    OR auth.uid() IN (SELECT user_id FROM public.reports WHERE id = report_id)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Collector Reviews ────────────────────────────────────────

CREATE TABLE public.collector_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES public.pickup_bids(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bid_id, reviewer_id)
);

ALTER TABLE public.collector_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.collector_reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews"
  ON public.collector_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- ── Sponsorships ─────────────────────────────────────────────

CREATE TABLE public.sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  tier public.sponsorship_tier NOT NULL DEFAULT 'bronze',
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_allocated INTEGER NOT NULL DEFAULT 0, -- in Naira
  budget_spent INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sponsorships are public"
  ON public.sponsorships FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins manage sponsorships"
  ON public.sponsorships FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── Sponsored Rewards (link sponsors to rewards) ─────────────

CREATE TABLE public.sponsored_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_id UUID NOT NULL REFERENCES public.sponsorships(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE SET NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  budget_allocated INTEGER NOT NULL DEFAULT 0,
  budget_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sponsored_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsored rewards are public"
  ON public.sponsored_rewards FOR SELECT USING (true);

CREATE POLICY "Admins manage sponsored rewards"
  ON public.sponsored_rewards FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── Carbon Tracking ──────────────────────────────────────────

CREATE TABLE public.carbon_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  estimated_weight_kg NUMERIC(10,2), -- estimated waste weight
  waste_type TEXT NOT NULL, -- category from report
  co2_avoided_kg NUMERIC(10,2), -- calculated CO2 equivalent
  verification_status TEXT DEFAULT 'estimated', -- estimated, verified, certified
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id)
);

ALTER TABLE public.carbon_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carbon data is public"
  ON public.carbon_tracking FOR SELECT USING (true);

CREATE POLICY "Authority and admin can manage carbon data"
  ON public.carbon_tracking FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'authority')
  ));

-- ── Achievements / Badges ────────────────────────────────────

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Award', -- Lucide icon name
  color TEXT NOT NULL DEFAULT '#22c55e',
  category TEXT NOT NULL DEFAULT 'general', -- general, reporting, events, community, milestone
  criteria_type TEXT NOT NULL, -- report_count, event_count, streak_days, upvotes_received, referral_count, points_total, first_action
  criteria_value INTEGER NOT NULL DEFAULT 1,
  points_reward INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are public"
  ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Admins manage achievements"
  ON public.achievements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE TABLE public.user_achievements (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User achievements are public"
  ON public.user_achievements FOR SELECT USING (true);

CREATE POLICY "System can grant achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

-- ── Premium Subscriptions ────────────────────────────────────

CREATE TABLE public.premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, annual
  amount_naira INTEGER NOT NULL,
  status public.subscription_status DEFAULT 'trial',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.premium_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can manage subscriptions"
  ON public.premium_subscriptions FOR ALL
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── Platform Revenue Tracking ────────────────────────────────

CREATE TABLE public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- redemption_fee, collector_commission, subscription, sponsorship, recycling_share
  amount_naira INTEGER NOT NULL,
  reference_id TEXT, -- ID of the related transaction
  reference_type TEXT, -- redemption, pickup_bid, subscription, sponsorship
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view revenue"
  ON public.platform_revenue FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can insert revenue"
  ON public.platform_revenue FOR INSERT
  WITH CHECK (true);

-- ── Add is_premium to profiles ───────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- ── Seed default achievements ────────────────────────────────

INSERT INTO public.achievements (slug, name, description, icon, color, category, criteria_type, criteria_value, points_reward, sort_order) VALUES
  ('first_report', 'First Report', 'Submit your first waste report', 'FileText', '#22c55e', 'reporting', 'first_action', 1, 5, 1),
  ('five_reports', 'Report Enthusiast', 'Submit 5 waste reports', 'FileText', '#22c55e', 'reporting', 'report_count', 5, 10, 2),
  ('twenty_reports', 'Waste Watchdog', 'Submit 20 waste reports', 'Eye', '#0ea5e9', 'reporting', 'report_count', 20, 25, 3),
  ('fifty_reports', 'Report Master', 'Submit 50 waste reports', 'Crown', '#a855f7', 'reporting', 'report_count', 50, 50, 4),
  ('hundred_reports', 'Sentinel', 'Submit 100 waste reports', 'Shield', '#ef4444', 'reporting', 'report_count', 100, 100, 5),
  ('neighborhood_guardian', 'Neighborhood Guardian', 'Have 10 reports in the same area', 'MapPin', '#f97316', 'reporting', 'report_count', 10, 20, 6),
  ('first_event', 'Event Explorer', 'Attend your first cleanup event', 'Calendar', '#22c55e', 'events', 'first_action', 1, 5, 10),
  ('event_organizer', 'Event Organizer', 'Organize 3 cleanup events', 'Megaphone', '#0ea5e9', 'events', 'event_count', 3, 30, 11),
  ('event_veteran', 'Event Veteran', 'Attend 10 cleanup events', 'Award', '#a855f7', 'events', 'event_count', 10, 50, 12),
  ('first_referral', 'Ambassador', 'Refer your first friend', 'UserPlus', '#22c55e', 'community', 'referral_count', 1, 10, 20),
  ('five_referrals', 'Recruiter', 'Refer 5 friends', 'Users', '#0ea5e9', 'community', 'referral_count', 5, 25, 21),
  ('upvote_collector', 'Popular Reporter', 'Receive 50 upvotes across all reports', 'ThumbsUp', '#f97316', 'community', 'upvotes_received', 50, 30, 22),
  ('streak_7', 'Streak Master', 'Report waste 7 days in a row', 'Flame', '#ef4444', 'milestone', 'streak_days', 7, 30, 30),
  ('streak_30', 'Monthly Warrior', 'Report waste 30 days in a row', 'Flame', '#a855f7', 'milestone', 'streak_days', 30, 100, 31),
  ('hundred_points', 'Century', 'Earn 100 total points', 'Star', '#eab308', 'milestone', 'points_total', 100, 0, 40),
  ('five_hundred_points', 'Half Millennium', 'Earn 500 total points', 'Star', '#0ea5e9', 'milestone', 'points_total', 500, 0, 41),
  ('two_thousand_points', 'Legend', 'Earn 2000 total points', 'Trophy', '#a855f7', 'milestone', 'points_total', 2000, 0, 42),
  ('impact_maker', 'Impact Maker', 'Have 5 of your reports resolved', 'CheckCircle2', '#22c55e', 'reporting', 'report_count', 5, 25, 7)
ON CONFLICT (slug) DO NOTHING;

-- ── Revenue views ────────────────────────────────────────────

CREATE OR REPLACE VIEW public.revenue_stats AS
SELECT
  COALESCE(SUM(amount_naira), 0) AS total_revenue,
  COALESCE(SUM(CASE WHEN source = 'redemption_fee' THEN amount_naira ELSE 0 END), 0) AS fee_revenue,
  COALESCE(SUM(CASE WHEN source = 'collector_commission' THEN amount_naira ELSE 0 END), 0) AS commission_revenue,
  COALESCE(SUM(CASE WHEN source = 'subscription' THEN amount_naira ELSE 0 END), 0) AS subscription_revenue,
  COALESCE(SUM(CASE WHEN source = 'sponsorship' THEN amount_naira ELSE 0 END), 0) AS sponsorship_revenue,
  COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN amount_naira ELSE 0 END), 0) AS revenue_this_week,
  COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount_naira ELSE 0 END), 0) AS revenue_this_month
FROM public.platform_revenue;

-- ── Carbon impact view ───────────────────────────────────────

CREATE OR REPLACE VIEW public.carbon_stats AS
SELECT
  COUNT(*) AS tracked_reports,
  COALESCE(SUM(estimated_weight_kg), 0) AS total_weight_kg,
  COALESCE(SUM(co2_avoided_kg), 0) AS total_co2_avoided_kg,
  COALESCE(SUM(CASE WHEN verification_status = 'verified' THEN co2_avoided_kg ELSE 0 END), 0) AS verified_co2_kg,
  COALESCE(SUM(CASE WHEN verification_status = 'certified' THEN co2_avoided_kg ELSE 0 END), 0) AS certified_co2_kg
FROM public.carbon_tracking;

-- ── Collector stats view ─────────────────────────────────────

CREATE OR REPLACE VIEW public.collector_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'verified') AS active_collectors,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_collectors,
  COALESCE(SUM(total_pickups), 0) AS total_pickups,
  COALESCE(SUM(total_earnings), 0) AS total_collector_earnings
FROM public.collector_profiles;

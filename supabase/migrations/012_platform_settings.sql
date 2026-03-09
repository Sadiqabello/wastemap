-- ============================================================
-- Migration 012: Platform Settings
-- Adds: platform_settings table for admin-configurable values
-- ============================================================

CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for frontend point values, etc.)
CREATE POLICY "Settings are readable by everyone"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage settings"
  ON public.platform_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Seed default settings ──────────────────────────────────

INSERT INTO public.platform_settings (key, value, description, category) VALUES
  -- General
  ('general.platform_name', '"WasteMapNaija"', 'Platform display name', 'general'),
  ('general.support_email', '"support@wastemap.ng"', 'Support contact email', 'general'),
  ('general.maintenance_mode', 'false', 'Enable maintenance mode to block non-admin access', 'general'),

  -- Points
  ('points.report_submitted', '10', 'Points awarded when a report is submitted', 'points'),
  ('points.report_verified', '5', 'Points awarded when a report is verified/acknowledged', 'points'),
  ('points.report_resolved', '15', 'Points awarded when a report is resolved', 'points'),
  ('points.event_attended', '10', 'Points awarded for attending a completed event', 'points'),
  ('points.event_organized', '20', 'Points awarded for organizing an event', 'points'),
  ('points.referral_bonus', '25', 'Points awarded for a successful referral', 'points'),
  ('points.signup_bonus', '10', 'Points awarded on signup via referral', 'points'),

  -- Fees
  ('fees.platform_fee_percent', '5', 'Platform fee percentage on redemptions', 'fees'),
  ('fees.collector_commission_percent', '15', 'Commission percentage on collector pickup bids', 'fees'),
  ('fees.recycling_platform_share_percent', '20', 'Platform share percentage of recycling value', 'fees'),

  -- Limits
  ('limits.min_bid_amount', '200', 'Minimum bid amount in Naira for collector pickups', 'limits'),
  ('limits.max_redemption_per_day', '5000', 'Maximum points a user can redeem per day', 'limits'),
  ('limits.max_report_photos', '5', 'Maximum number of photos allowed per report', 'limits')
ON CONFLICT (key) DO NOTHING;

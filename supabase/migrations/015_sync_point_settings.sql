-- ============================================================
-- Migration 015: Sync point settings with actual POINT_VALUES
-- Replaces the 7 generic point settings with all 16 actual
-- point action keys used in the codebase.
-- ============================================================

-- Remove old generic point settings that don't match any code keys
DELETE FROM public.platform_settings
WHERE key IN (
  'points.report_submitted',
  'points.report_verified',
  'points.event_organized',
  'points.referral_bonus',
  'points.signup_bonus'
);

-- Upsert all 16 point action settings
INSERT INTO public.platform_settings (key, value, description, category) VALUES
  -- Reports (6)
  ('points.report_created',       '10', 'Points for submitting a new waste report', 'points'),
  ('points.photos_uploaded',      '5',  'Bonus points for adding photos to a report', 'points'),
  ('points.upvoted_report',       '1',  'Points for upvoting another report', 'points'),
  ('points.report_acknowledged',  '5',  'Points when your report is acknowledged', 'points'),
  ('points.report_resolved',      '20', 'Points when your report is resolved', 'points'),
  ('points.resolved_report',      '15', 'Points for resolving someone else''s report', 'points'),

  -- Events (4)
  ('points.event_created',        '15', 'Points for organizing a cleanup event', 'points'),
  ('points.event_joined',         '5',  'Points for RSVPing to an event', 'points'),
  ('points.event_completed',      '25', 'Bonus points for organizer when event completes', 'points'),
  ('points.event_attended',       '10', 'Points for attending a completed event', 'points'),

  -- Referrals (6)
  ('points.referral_signup',      '5',  'Points when a referred user signs up', 'points'),
  ('points.referral_first_report','20', 'Points when a referred user submits first report', 'points'),
  ('points.referral_first_event', '15', 'Points when a referred user joins first event', 'points'),
  ('points.referred_bonus',       '5',  'Signup bonus for the referred user', 'points'),
  ('points.referred_first_report','15', 'First report bonus for the referred user', 'points'),
  ('points.referred_first_event', '10', 'First event bonus for the referred user', 'points')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

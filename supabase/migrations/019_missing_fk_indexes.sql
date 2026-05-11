-- ============================================================
-- Missing foreign-key indexes
-- ============================================================
-- Postgres does not auto-index foreign keys. Queries that filter or join
-- on these columns (very common: "all bids by collector X", "all referrals
-- of user Y") currently do a sequential scan. Adding the indexes is cheap
-- and the queries we care about already exist in the query layer.
--
-- Uses `IF NOT EXISTS` so the migration is safe to re-run.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pickup_bids_collector_id
  ON public.pickup_bids (collector_id);

CREATE INDEX IF NOT EXISTS idx_pickup_bids_report_id
  ON public.pickup_bids (report_id);

CREATE INDEX IF NOT EXISTS idx_pickup_bids_status
  ON public.pickup_bids (status)
  WHERE status IN ('pending', 'accepted');

CREATE INDEX IF NOT EXISTS idx_referrals_referred_id
  ON public.referrals (referred_id);

CREATE INDEX IF NOT EXISTS idx_collector_reviews_collector_id
  ON public.collector_reviews (collector_id);

CREATE INDEX IF NOT EXISTS idx_collector_reviews_reviewer_id
  ON public.collector_reviews (reviewer_id);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_active
  ON public.premium_subscriptions (user_id, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_redemptions_provider_reference
  ON public.redemptions (provider_reference)
  WHERE provider_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_status_updates_changed_by
  ON public.status_updates (changed_by);

CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id
  ON public.event_attendees (user_id);

CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id
  ON public.user_challenges (user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id
  ON public.user_achievements (user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id
  ON public.point_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at
  ON public.point_transactions (created_at DESC);

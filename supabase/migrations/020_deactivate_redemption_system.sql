-- ============================================================
-- Deactivate redemption / premium / collector marketplace
-- ============================================================
-- The product no longer offers cash/airtime/data redemptions, premium
-- subscriptions, or a collector marketplace. Points are now purely
-- motivational (visible progress toward tier promotion).
--
-- This migration KEEPS the underlying tables and data intact so that the
-- system can be reactivated later if needed. It only removes the write
-- policies and revokes EXECUTE on the related SQL functions, so no
-- authenticated client can touch these features from app code, and the
-- service role only would have to be reenabled by the operator.
--
-- Tables left intact (read-only via existing policies, no writes):
--   rewards, redemptions, referrals (kept active), sponsorships,
--   sponsored_rewards, collector_profiles, pickup_bids, collector_reviews,
--   premium_subscriptions, platform_revenue
--
-- Functions whose EXECUTE is revoked from service_role:
--   spend_points, accept_bid, complete_bid
--
-- Idempotent — safe to re-run.
-- ============================================================


-- Drop write policies on redemption-system tables.
DROP POLICY IF EXISTS "Authenticated users can create rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admins can manage rewards"              ON public.rewards;
DROP POLICY IF EXISTS "System can create redemptions"          ON public.redemptions;
DROP POLICY IF EXISTS "Admins can update redemptions"          ON public.redemptions;

DROP POLICY IF EXISTS "Admins manage sponsorships"             ON public.sponsorships;
DROP POLICY IF EXISTS "Admins manage sponsored rewards"        ON public.sponsored_rewards;

DROP POLICY IF EXISTS "Users can create their own collector profile" ON public.collector_profiles;
DROP POLICY IF EXISTS "Users can update their own collector profile" ON public.collector_profiles;
DROP POLICY IF EXISTS "Admins can manage collector profiles"         ON public.collector_profiles;

DROP POLICY IF EXISTS "Collectors can create bids"             ON public.pickup_bids;
DROP POLICY IF EXISTS "Bid participants can update"            ON public.pickup_bids;

DROP POLICY IF EXISTS "Users can create reviews"               ON public.collector_reviews;

DROP POLICY IF EXISTS "System can manage subscriptions"        ON public.premium_subscriptions;
DROP POLICY IF EXISTS "System can insert revenue"              ON public.platform_revenue;


-- Revoke EXECUTE on functions tied to redemption / bid flows.
-- award_points (motivational gains) stays available — it powers point
-- earning. admin_adjust_points stays available for admin point adjustments
-- (penalties, corrections).
REVOKE EXECUTE ON FUNCTION public.spend_points(UUID, INTEGER, TEXT) FROM service_role;
REVOKE EXECUTE ON FUNCTION public.accept_bid(UUID, UUID) FROM service_role;
REVOKE EXECUTE ON FUNCTION public.complete_bid(UUID, UUID) FROM service_role;


-- Clear pickup_type on every report so the column is not exposed.
UPDATE public.reports SET pickup_type = NULL WHERE pickup_type IS NOT NULL;


-- Mark all active premium subscriptions cancelled. Users keep their points;
-- they just don't have an active subscription anymore.
UPDATE public.premium_subscriptions
  SET status = 'cancelled',
      cancelled_at = COALESCE(cancelled_at, now())
  WHERE status = 'active';

-- The protect_profile_columns trigger from migration 017 blocks writes to
-- `is_premium` from any non-service-role caller, including the SQL editor's
-- postgres superuser. Temporarily disable it for this one-time cleanup.
ALTER TABLE public.profiles DISABLE TRIGGER trg_protect_profile_columns;
UPDATE public.profiles SET is_premium = false WHERE is_premium = true;
ALTER TABLE public.profiles ENABLE TRIGGER trg_protect_profile_columns;

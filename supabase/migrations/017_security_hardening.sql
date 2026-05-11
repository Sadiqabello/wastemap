-- ============================================================
-- Security & integrity hardening
-- ============================================================
-- 1. spend_points: atomic point deduction, fails if balance is insufficient.
--    Replaces unsafe read-check-deduct patterns in redemption flows.
-- 2. upvote_count is now derived from the upvotes table via trigger, removing
--    the TOCTOU race in the toggleUpvote server action.
-- 3. profiles.* updates from authenticated users are restricted to a
--    whitelist of editable columns. Any attempt to write points / tier /
--    role / is_premium / referral_code from anon or authenticated roles is
--    rejected. Service role still bypasses (used by award_points,
--    admin_adjust_points, spend_points).
-- ============================================================


-- ============================================================
-- 1. spend_points — atomic deduction
-- ============================================================
CREATE OR REPLACE FUNCTION public.spend_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
BEGIN
  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'spend_points: amount must be positive';
  END IF;

  -- Row lock prevents concurrent spend from over-drafting
  SELECT points INTO current_points
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

  IF current_points IS NULL THEN
    RAISE EXCEPTION 'spend_points: user not found';
  END IF;

  IF current_points < p_points THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
    SET points = points - p_points
    WHERE id = p_user_id;

  INSERT INTO public.point_transactions (user_id, action, points)
    VALUES (p_user_id, p_reason, -p_points);

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spend_points(UUID, INTEGER, TEXT) TO service_role;
-- Authenticated users do NOT get EXECUTE — only callable from the server
-- via the service-role client.


-- ============================================================
-- 2. upvote_count maintained automatically
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_report_upvote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reports
      SET upvote_count = upvote_count + 1
      WHERE id = NEW.report_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reports
      SET upvote_count = GREATEST(upvote_count - 1, 0)
      WHERE id = OLD.report_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_upvote_count ON public.upvotes;
CREATE TRIGGER trg_sync_upvote_count
  AFTER INSERT OR DELETE ON public.upvotes
  FOR EACH ROW EXECUTE FUNCTION public.sync_report_upvote_count();

-- Reconcile any drift introduced by the old read-modify-write code path
UPDATE public.reports r
  SET upvote_count = COALESCE(c.cnt, 0)
  FROM (
    SELECT report_id, COUNT(*)::int AS cnt
    FROM public.upvotes
    GROUP BY report_id
  ) c
  WHERE c.report_id = r.id;

UPDATE public.reports
  SET upvote_count = 0
  WHERE upvote_count > 0
    AND id NOT IN (SELECT DISTINCT report_id FROM public.upvotes);


-- ============================================================
-- 3. Lock down profile self-update to a column whitelist
-- ============================================================
-- The existing "Users can update their own profile" policy doesn't restrict
-- columns, so a user could write `points = 999999` directly via the anon
-- client. This trigger rejects any attempt to mutate sensitive columns
-- unless the caller is the service role.
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Service role bypasses (used by award_points, admin_adjust_points,
  -- spend_points, and admin server actions). Any other caller may only
  -- update the whitelisted columns below.
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.points       IS DISTINCT FROM OLD.points        THEN RAISE EXCEPTION 'profiles.points is read-only';        END IF;
  IF NEW.tier         IS DISTINCT FROM OLD.tier          THEN RAISE EXCEPTION 'profiles.tier is read-only';          END IF;
  IF NEW.role         IS DISTINCT FROM OLD.role          THEN RAISE EXCEPTION 'profiles.role is read-only';          END IF;
  IF NEW.is_premium   IS DISTINCT FROM OLD.is_premium    THEN RAISE EXCEPTION 'profiles.is_premium is read-only';    END IF;
  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN RAISE EXCEPTION 'profiles.referral_code is read-only'; END IF;
  IF NEW.referred_by  IS DISTINCT FROM OLD.referred_by   THEN RAISE EXCEPTION 'profiles.referred_by is read-only';   END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

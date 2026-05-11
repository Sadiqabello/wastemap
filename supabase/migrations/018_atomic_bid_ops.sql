-- ============================================================
-- Atomic bid operations
-- ============================================================
-- Wraps the multi-step accept_bid / complete_bid flows in single SQL
-- transactions. Previously each was a sequence of 4–6 Supabase calls from
-- the server action; if any step failed mid-way the system was left with
-- partial state (bid accepted but siblings still pending; pickup completed
-- but collector earnings not updated; etc.).
--
-- Both functions return JSONB of the form { ok: boolean, error?: text } so
-- the caller can branch without parsing exceptions.
-- ============================================================


-- ============================================================
-- accept_bid
-- ============================================================
-- Locks the bid row, verifies ownership, marks this bid accepted,
-- and rejects all other pending bids on the same report.
CREATE OR REPLACE FUNCTION public.accept_bid(
  p_bid_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bid public.pickup_bids%ROWTYPE;
  v_report_owner UUID;
BEGIN
  SELECT * INTO v_bid
    FROM public.pickup_bids
    WHERE id = p_bid_id
    FOR UPDATE;

  IF v_bid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Bid not found');
  END IF;

  SELECT user_id INTO v_report_owner
    FROM public.reports
    WHERE id = v_bid.report_id;

  IF v_report_owner IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Report not found');
  END IF;

  IF v_report_owner <> p_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only the report owner can accept bids');
  END IF;

  IF v_bid.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'This bid is no longer pending');
  END IF;

  UPDATE public.pickup_bids
    SET status = 'accepted'
    WHERE id = p_bid_id;

  UPDATE public.pickup_bids
    SET status = 'rejected'
    WHERE report_id = v_bid.report_id
      AND id <> p_bid_id
      AND status = 'pending';

  RETURN jsonb_build_object(
    'ok', true,
    'collector_id', v_bid.collector_id,
    'report_id', v_bid.report_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_bid(UUID, UUID) TO service_role;


-- ============================================================
-- complete_bid
-- ============================================================
-- Marks a bid completed and atomically performs:
--   - Update bid status + completed_at
--   - Increment collector_profiles.total_pickups and total_earnings
--   - For cleanup: deduct points from reporter, credit collector
--   - For recycling: credit reporter for the materials
--   - Insert platform_revenue row for the commission
--   - Clear reports.pickup_type so it doesn't appear in the open list
CREATE OR REPLACE FUNCTION public.complete_bid(
  p_bid_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bid public.pickup_bids%ROWTYPE;
  v_report_owner UUID;
  v_is_recycling BOOLEAN;
  v_collector_earnings INTEGER;
BEGIN
  SELECT * INTO v_bid
    FROM public.pickup_bids
    WHERE id = p_bid_id
    FOR UPDATE;

  IF v_bid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Bid not found');
  END IF;

  IF v_bid.collector_id <> p_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only the collector can complete this bid');
  END IF;

  IF v_bid.status <> 'accepted' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Bid must be accepted first');
  END IF;

  SELECT user_id INTO v_report_owner
    FROM public.reports
    WHERE id = v_bid.report_id;

  IF v_report_owner IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Report not found');
  END IF;

  v_is_recycling := COALESCE(v_bid.bid_type = 'recycling', false);
  v_collector_earnings := CASE WHEN v_is_recycling THEN 0
                               ELSE v_bid.bid_amount - v_bid.platform_fee
                          END;

  -- Mark bid completed
  UPDATE public.pickup_bids
    SET status = 'completed',
        completed_at = now()
    WHERE id = p_bid_id;

  -- Collector profile stats — atomic increment
  UPDATE public.collector_profiles
    SET total_pickups = total_pickups + 1,
        total_earnings = total_earnings + v_collector_earnings
    WHERE user_id = p_user_id;

  IF v_is_recycling THEN
    -- Collector pays reporter for the recyclables
    UPDATE public.profiles
      SET points = points + v_bid.bid_amount
      WHERE id = v_report_owner;
    INSERT INTO public.point_transactions (user_id, action, points)
      VALUES (v_report_owner,
              format('Recycling sale: ₦%s for collected materials', v_bid.bid_amount),
              v_bid.bid_amount);

    INSERT INTO public.platform_revenue (source, amount_naira, reference_id, reference_type, description)
      VALUES ('recycling_commission',
              v_bid.platform_fee,
              p_bid_id,
              'pickup_bid',
              format('Commission on ₦%s recycling purchase', v_bid.bid_amount));
  ELSE
    -- Reporter pays collector for the cleanup
    UPDATE public.profiles
      SET points = points + v_collector_earnings
      WHERE id = p_user_id;
    INSERT INTO public.point_transactions (user_id, action, points)
      VALUES (p_user_id,
              format('Cleanup payment: ₦%s after commission', v_collector_earnings),
              v_collector_earnings);

    UPDATE public.profiles
      SET points = GREATEST(points - v_bid.bid_amount, 0)
      WHERE id = v_report_owner;
    INSERT INTO public.point_transactions (user_id, action, points)
      VALUES (v_report_owner,
              format('Cleanup fee: ₦%s paid to collector', v_bid.bid_amount),
              -v_bid.bid_amount);

    INSERT INTO public.platform_revenue (source, amount_naira, reference_id, reference_type, description)
      VALUES ('collector_commission',
              v_bid.platform_fee,
              p_bid_id,
              'pickup_bid',
              format('Commission on ₦%s cleanup', v_bid.bid_amount));
  END IF;

  -- Clear pickup_type so the report falls off the open list
  UPDATE public.reports
    SET pickup_type = NULL
    WHERE id = v_bid.report_id;

  RETURN jsonb_build_object(
    'ok', true,
    'report_id', v_bid.report_id,
    'report_owner', v_report_owner,
    'is_recycling', v_is_recycling
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_bid(UUID, UUID) TO service_role;

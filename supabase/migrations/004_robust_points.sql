-- ============================================================
-- Robust Points System Migration
-- Atomic increments, event points, duplicate prevention
-- ============================================================

-- Add event_id column to point_transactions for event-related points
ALTER TABLE public.point_transactions
  ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

CREATE INDEX idx_point_transactions_event ON public.point_transactions(event_id);
CREATE INDEX idx_point_transactions_action ON public.point_transactions(action);

-- Unique constraint: prevent duplicate points for the same user+action+report
-- (e.g., can't get "report_created" points twice for the same report)
CREATE UNIQUE INDEX idx_unique_report_points
  ON public.point_transactions(user_id, action, report_id)
  WHERE report_id IS NOT NULL;

-- Unique constraint: prevent duplicate points for the same user+action+event
CREATE UNIQUE INDEX idx_unique_event_points
  ON public.point_transactions(user_id, action, event_id)
  WHERE event_id IS NOT NULL;

-- Atomic point increment function (avoids race conditions)
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_action TEXT,
  p_points INTEGER,
  p_report_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert transaction (will fail on duplicate due to unique indexes)
  INSERT INTO public.point_transactions (user_id, action, points, report_id, event_id)
  VALUES (p_user_id, p_action, p_points, p_report_id, p_event_id);

  -- Atomic increment on profiles
  UPDATE public.profiles
  SET points = points + p_points
  WHERE id = p_user_id;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    -- Duplicate action, skip silently
    RETURN FALSE;
END;
$$;

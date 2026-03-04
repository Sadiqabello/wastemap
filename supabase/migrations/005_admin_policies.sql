-- =============================================================
-- 005_admin_policies.sql — Admin dashboard RLS, views, functions
-- =============================================================

-- -----------------------------------------------
-- RLS: Admin can delete any report
-- -----------------------------------------------
CREATE POLICY "Admins can delete any report"
  ON public.reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- -----------------------------------------------
-- RLS: Admin can update any profile (e.g. change role)
-- -----------------------------------------------
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- -----------------------------------------------
-- RLS: Admin can update any event
-- -----------------------------------------------
CREATE POLICY "Admins can update any event"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- -----------------------------------------------
-- RLS: Admin can delete any event
-- -----------------------------------------------
CREATE POLICY "Admins can delete any event"
  ON public.events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- -----------------------------------------------
-- View: admin_stats — aggregate counts for the dashboard
-- -----------------------------------------------
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT count(*) FROM public.profiles)::int AS total_users,
  (SELECT count(*) FROM public.reports)::int AS total_reports,
  (SELECT count(*) FROM public.events)::int AS total_events,
  (SELECT count(*) FROM public.reports WHERE status NOT IN ('resolved'))::int AS pending_reports,
  (SELECT count(*) FROM public.reports WHERE status = 'resolved')::int AS resolved_reports,
  (SELECT count(*) FROM public.profiles WHERE created_at >= now() - interval '7 days')::int AS new_users_this_week,
  (SELECT count(*) FROM public.profiles WHERE created_at >= now() - interval '30 days')::int AS new_users_this_month,
  (SELECT count(*) FROM public.reports WHERE created_at >= now() - interval '7 days')::int AS reports_this_week,
  (SELECT count(*) FROM public.reports WHERE created_at >= now() - interval '30 days')::int AS reports_this_month;

-- -----------------------------------------------
-- Function: admin_adjust_points — manual point adjustment
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_adjust_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a point_transaction record
  INSERT INTO public.point_transactions (user_id, action, points)
  VALUES (p_user_id, p_reason, p_points);

  -- Update the user's total points
  UPDATE public.profiles
  SET points = points + p_points
  WHERE id = p_user_id;
END;
$$;

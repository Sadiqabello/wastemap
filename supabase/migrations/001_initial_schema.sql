-- WasteMap Database Schema
-- Run this in the Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE waste_category AS ENUM (
  'household',
  'industrial',
  'hazardous',
  'electronic',
  'construction',
  'medical',
  'organic',
  'other'
);

CREATE TYPE severity_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE report_status AS ENUM (
  'reported',
  'acknowledged',
  'cleanup_scheduled',
  'in_progress',
  'resolved'
);

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'reporter' CHECK (role IN ('reporter', 'authority', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category waste_category NOT NULL,
  severity severity_level NOT NULL DEFAULT 'medium',
  status report_status NOT NULL DEFAULT 'reported',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  upvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Status Updates (audit trail)
CREATE TABLE public.status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  old_status report_status,
  new_status report_status NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upvotes
CREATE TABLE public.upvotes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, report_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_reports_location ON public.reports (latitude, longitude);
CREATE INDEX idx_reports_status ON public.reports (status);
CREATE INDEX idx_reports_category ON public.reports (category);
CREATE INDEX idx_reports_user_id ON public.reports (user_id);
CREATE INDEX idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX idx_status_updates_report_id ON public.status_updates (report_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Reports policies
CREATE POLICY "Reports are viewable by everyone"
  ON public.reports FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins and authorities can update any report"
  ON public.reports FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'authority')
    )
  );

CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE USING (auth.uid() = user_id);

-- Status updates policies
CREATE POLICY "Status updates are viewable by everyone"
  ON public.status_updates FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create status updates"
  ON public.status_updates FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- Upvotes policies
CREATE POLICY "Upvotes viewable by everyone"
  ON public.upvotes FOR SELECT USING (true);

CREATE POLICY "Users can upvote"
  ON public.upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvote"
  ON public.upvotes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reports_updated
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  COUNT(*)::int AS total_reports,
  COUNT(*) FILTER (WHERE status = 'reported')::int AS pending_reports,
  COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_reports,
  COUNT(*) FILTER (WHERE status IN ('acknowledged', 'cleanup_scheduled', 'in_progress'))::int AS in_progress_reports,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days')::int AS reports_this_week,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '30 days')::int AS reports_this_month
FROM public.reports;

-- ============================================
-- STORAGE
-- ============================================

-- Run this separately in the Supabase SQL Editor if the bucket doesn't exist:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true);

-- Storage policies (run after creating the bucket)
-- CREATE POLICY "Anyone can view report photos"
--   ON storage.objects FOR SELECT USING (bucket_id = 'report-photos');
-- CREATE POLICY "Authenticated users can upload report photos"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-photos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can delete their own photos"
--   ON storage.objects FOR DELETE USING (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

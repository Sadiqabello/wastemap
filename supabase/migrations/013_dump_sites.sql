-- ============================================================
-- Migration 013: Dump Sites
-- Official waste disposal locations (trash cans, bins, dump sites)
-- ============================================================

CREATE TYPE public.dump_site_type AS ENUM (
  'trash_can',
  'recycling_bin',
  'dumpster',
  'transfer_station',
  'landfill',
  'compost_site',
  'drop_off_center',
  'street_bin'
);

CREATE TYPE public.dump_site_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'closed'
);

CREATE TABLE public.dump_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  site_type public.dump_site_type NOT NULL,
  status public.dump_site_status NOT NULL DEFAULT 'pending',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  operating_hours TEXT,
  accepts TEXT[] DEFAULT '{}',
  is_free BOOLEAN DEFAULT true,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dump_sites_location ON public.dump_sites (latitude, longitude);
CREATE INDEX idx_dump_sites_status ON public.dump_sites (status);
CREATE INDEX idx_dump_sites_type ON public.dump_sites (site_type);

-- RLS
ALTER TABLE public.dump_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dump sites are readable by everyone"
  ON public.dump_sites FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add dump sites"
  ON public.dump_sites FOR INSERT
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can update their own pending dump sites"
  ON public.dump_sites FOR UPDATE
  USING (auth.uid() = added_by AND status = 'pending');

CREATE POLICY "Admins can manage all dump sites"
  ON public.dump_sites FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage bucket for dump site photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dump-site-photos', 'dump-site-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read dump site photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dump-site-photos');

CREATE POLICY "Auth users upload dump site photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dump-site-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users delete own dump site photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dump-site-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

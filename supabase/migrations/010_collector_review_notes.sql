-- Add "rejected" to collector_status enum
ALTER TYPE public.collector_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add review_note and reviewed_at columns to collector_profiles
ALTER TABLE public.collector_profiles
  ADD COLUMN IF NOT EXISTS review_note TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

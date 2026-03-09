-- Pickup type: cleanup (reporter pays) vs recycling (collector pays reporter)
CREATE TYPE public.pickup_type AS ENUM ('cleanup', 'recycling');

-- Add pickup_type to reports (null = no pickup requested)
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS pickup_type public.pickup_type,
  ADD COLUMN IF NOT EXISTS estimated_weight_kg NUMERIC(10,2);

-- Add bid_type to pickup_bids to mirror the report's pickup type
ALTER TABLE public.pickup_bids
  ADD COLUMN IF NOT EXISTS bid_type public.pickup_type NOT NULL DEFAULT 'cleanup';

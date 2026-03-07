-- Add live streaming support to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_live boolean NOT NULL DEFAULT false;

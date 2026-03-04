-- ============================================================
-- WasteMap Enhancement Migration
-- Before/After photos, Gamification, Cleanup Events
-- ============================================================

-- Before/After photos
ALTER TABLE public.reports ADD COLUMN cleanup_photo_urls TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.status_updates ADD COLUMN photo_urls TEXT[] NOT NULL DEFAULT '{}';

-- Gamification
ALTER TABLE public.profiles ADD COLUMN points INTEGER NOT NULL DEFAULT 0;

CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_point_transactions_user ON public.point_transactions(user_id);
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Point transactions viewable by everyone" ON public.point_transactions FOR SELECT USING (true);
CREATE POLICY "System can insert point transactions" ON public.point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cleanup Events
CREATE TYPE event_status AS ENUM ('upcoming', 'in_progress', 'completed', 'cancelled');

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  report_ids UUID[] DEFAULT '{}',
  max_attendees INTEGER,
  tools_provided TEXT,
  tools_needed TEXT,
  status event_status NOT NULL DEFAULT 'upcoming',
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Auth users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own events" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

CREATE TRIGGER on_events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.event_attendees (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendees viewable by everyone" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can RSVP" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update RSVP" ON public.event_attendees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove RSVP" ON public.event_attendees FOR DELETE USING (auth.uid() = user_id);

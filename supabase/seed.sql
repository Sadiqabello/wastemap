-- WasteMapNaija Seed Data
-- Creates demo users, reports, events, and activity
-- Run AFTER migrations. Uses service_role context (supabase db reset runs this automatically).

-- ============================================
-- 1. CREATE DEMO USERS via auth.users
--    The on_auth_user_created trigger auto-creates profiles.
-- ============================================

-- Admin user
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Adamu Musa"}'::jsonb,
  now() - interval '60 days',
  now()
  , '', ''
) ON CONFLICT (id) DO NOTHING;

-- Authority user
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'authority@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Fatima Bello"}'::jsonb,
  now() - interval '45 days',
  now()
  , '', ''
) ON CONFLICT (id) DO NOTHING;

-- Reporter users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES
(
  'a0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'chidi@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Chidi Okafor"}'::jsonb,
  now() - interval '30 days',
  now()
  , '', ''
),
(
  'a0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'amina@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Amina Ibrahim"}'::jsonb,
  now() - interval '21 days',
  now()
  , '', ''
),
(
  'a0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'emeka@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Emeka Nwankwo"}'::jsonb,
  now() - interval '14 days',
  now()
  , '', ''
),
(
  'a0000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'halima@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Halima Yusuf"}'::jsonb,
  now() - interval '10 days',
  now()
  , '', ''
),
(
  'a0000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'tunde@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Tunde Bakare"}'::jsonb,
  now() - interval '5 days',
  now()
  , '', ''
),
(
  'a0000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'ngozi@wastemap.ng',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Ngozi Eze"}'::jsonb,
  now() - interval '2 days',
  now()
  , '', ''
)
ON CONFLICT (id) DO NOTHING;

-- Create auth.identities entries (required for Supabase auth to work)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '60 days', now()),
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '{"sub":"a0000000-0000-0000-0000-000000000002","email":"authority@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '45 days', now()),
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '{"sub":"a0000000-0000-0000-0000-000000000003","email":"chidi@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '30 days', now()),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', '{"sub":"a0000000-0000-0000-0000-000000000004","email":"amina@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '21 days', now()),
  ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', '{"sub":"a0000000-0000-0000-0000-000000000005","email":"emeka@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '14 days', now()),
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', '{"sub":"a0000000-0000-0000-0000-000000000006","email":"halima@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '10 days', now()),
  ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', '{"sub":"a0000000-0000-0000-0000-000000000007","email":"tunde@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '5 days', now()),
  ('a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', '{"sub":"a0000000-0000-0000-0000-000000000008","email":"ngozi@wastemap.ng"}'::jsonb, 'email', now(), now() - interval '2 days', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. SET ROLES & POINTS on profiles
-- ============================================

-- Wait briefly for trigger to fire, then update profiles
-- (profiles are auto-created by the handle_new_user trigger)

UPDATE public.profiles SET role = 'admin',     points = 350, created_at = now() - interval '60 days' WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'authority',  points = 180, created_at = now() - interval '45 days' WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role = 'reporter',   points = 120, created_at = now() - interval '30 days' WHERE id = 'a0000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role = 'reporter',   points = 95,  created_at = now() - interval '21 days' WHERE id = 'a0000000-0000-0000-0000-000000000004';
UPDATE public.profiles SET role = 'reporter',   points = 75,  created_at = now() - interval '14 days' WHERE id = 'a0000000-0000-0000-0000-000000000005';
UPDATE public.profiles SET role = 'reporter',   points = 60,  created_at = now() - interval '10 days' WHERE id = 'a0000000-0000-0000-0000-000000000006';
UPDATE public.profiles SET role = 'reporter',   points = 40,  created_at = now() - interval '5 days'  WHERE id = 'a0000000-0000-0000-0000-000000000007';
UPDATE public.profiles SET role = 'reporter',   points = 15,  created_at = now() - interval '2 days'  WHERE id = 'a0000000-0000-0000-0000-000000000008';

-- ============================================
-- 3. REPORTS (spread across users, varied dates)
-- ============================================

INSERT INTO public.reports (user_id, title, description, category, severity, status, latitude, longitude, address, photo_urls, upvote_count, created_at) VALUES

-- Admin's reports
('a0000000-0000-0000-0000-000000000001', 'Illegal dumpsite behind Wuse Market', 'Large pile of mixed waste including plastic bags, food waste, and construction debris. Has been growing for weeks and attracting rodents.', 'household', 'high', 'reported', 9.0579, 7.4891, 'Behind Wuse Market, Zone 5, Abuja', '{}', 12, now() - interval '55 days'),
('a0000000-0000-0000-0000-000000000001', 'Cleared dumpsite at Maitama Park', 'Former illegal dumpsite has been cleaned up by community volunteers. Great progress!', 'household', 'low', 'resolved', 9.0800, 7.4800, 'Maitama District Park, Abuja', '{}', 24, now() - interval '40 days'),

-- Authority's reports
('a0000000-0000-0000-0000-000000000002', 'Electronic waste near Jabi Lake', 'Old computers, monitors, and phone parts dumped near the lakeside. Potential groundwater contamination risk.', 'electronic', 'critical', 'acknowledged', 9.0420, 7.4233, 'Jabi Lake area, Abuja', '{}', 18, now() - interval '42 days'),
('a0000000-0000-0000-0000-000000000002', 'Medical waste found in Garki', 'Used syringes and medical packaging found in an open drain. Extremely hazardous to children playing nearby.', 'medical', 'critical', 'in_progress', 9.0350, 7.4900, 'Garki Area 11, Abuja', '{}', 31, now() - interval '35 days'),
('a0000000-0000-0000-0000-000000000002', 'Industrial chemicals near Idu Railway', 'Barrels of unknown chemicals abandoned near the railway station. Possible chemical contamination.', 'hazardous', 'critical', 'acknowledged', 9.0100, 7.3900, 'Near Idu Railway Station, Abuja', '{}', 22, now() - interval '28 days'),

-- Chidi's reports
('a0000000-0000-0000-0000-000000000003', 'Construction debris on Ahmadu Bello Way', 'Rubble and cement waste from a demolished building left on the roadside for over a month.', 'construction', 'medium', 'cleanup_scheduled', 9.0580, 7.4950, 'Ahmadu Bello Way, Central Area, Abuja', '{}', 7, now() - interval '26 days'),
('a0000000-0000-0000-0000-000000000003', 'Plastic waste in Kubwa drainage', 'Plastic bottles and bags blocking drainage channels, causing flooding during rain.', 'household', 'high', 'reported', 9.1300, 7.3250, 'Kubwa, Phase 4, Abuja', '{}', 15, now() - interval '20 days'),
('a0000000-0000-0000-0000-000000000003', 'Cleaned up electronics at Wuse II', 'Community organized collection of e-waste. Successfully recycled through certified handlers.', 'electronic', 'low', 'resolved', 9.0650, 7.4700, 'Wuse II, Abuja', '{}', 20, now() - interval '10 days'),

-- Amina's reports
('a0000000-0000-0000-0000-000000000004', 'Organic waste pile at Area 1 junction', 'Rotting food waste from nearby restaurants being dumped openly. Strong smell and flies.', 'organic', 'medium', 'reported', 9.0500, 7.4870, 'Area 1 Junction, Garki, Abuja', '{}', 9, now() - interval '18 days'),
('a0000000-0000-0000-0000-000000000004', 'Factory waste in Nyanya', 'A small factory has been dumping production waste behind a residential area.', 'industrial', 'high', 'acknowledged', 9.0080, 7.5500, 'Nyanya, Abuja', '{}', 14, now() - interval '15 days'),
('a0000000-0000-0000-0000-000000000004', 'Food waste behind Ceddi Plaza', 'Restaurants dumping food waste in unauthorized area. Attracts stray animals.', 'organic', 'low', 'cleanup_scheduled', 9.0550, 7.4920, 'Behind Ceddi Plaza, Central Area, Abuja', '{}', 5, now() - interval '8 days'),

-- Emeka's reports
('a0000000-0000-0000-0000-000000000005', 'Tire dump near Lugbe', 'Hundreds of old tires dumped in an empty plot. Fire hazard and mosquito breeding ground.', 'industrial', 'high', 'reported', 8.9800, 7.3800, 'Lugbe, Airport Road, Abuja', '{}', 11, now() - interval '12 days'),
('a0000000-0000-0000-0000-000000000005', 'Sewage overflow in Gwarinpa', 'Sewage overflowing from a broken pipe onto the street. Health hazard for residents.', 'hazardous', 'critical', 'in_progress', 9.1050, 7.4100, 'Gwarinpa Estate, Abuja', '{}', 27, now() - interval '9 days'),

-- Halima's reports
('a0000000-0000-0000-0000-000000000006', 'Mixed waste at Apo Mechanic Village', 'Auto parts, used oil, and general waste mixed together in open area.', 'industrial', 'medium', 'reported', 9.0000, 7.5100, 'Apo Mechanic Village, Abuja', '{}', 8, now() - interval '7 days'),
('a0000000-0000-0000-0000-000000000006', 'Construction waste at Life Camp', 'Building materials and debris scattered across a vacant lot next to residential buildings.', 'construction', 'medium', 'reported', 9.0900, 7.4000, 'Life Camp, Abuja', '{}', 4, now() - interval '5 days'),

-- Tunde's reports
('a0000000-0000-0000-0000-000000000007', 'Burning waste near Dutse Alhaji', 'Residents openly burning household waste creating thick smoke. Respiratory health risk.', 'household', 'high', 'reported', 9.1100, 7.3500, 'Dutse Alhaji, Abuja', '{}', 16, now() - interval '4 days'),
('a0000000-0000-0000-0000-000000000007', 'Oil spill at Mpape quarry', 'Waste oil being dumped into the stream from the quarry operations. Fish are dying.', 'hazardous', 'critical', 'acknowledged', 9.1200, 7.4600, 'Mpape Quarry Road, Abuja', '{}', 19, now() - interval '3 days'),

-- Ngozi's reports
('a0000000-0000-0000-0000-000000000008', 'Mattress dumping at Karu bridge', 'Old mattresses and furniture dumped under the bridge. Becoming a shelter for rodents.', 'household', 'medium', 'reported', 8.9950, 7.5300, 'Karu Bridge, Abuja', '{}', 3, now() - interval '1 day'),
('a0000000-0000-0000-0000-000000000008', 'Hospital waste in Asokoro drain', 'Bandages, gloves, and other medical waste found in the drainage channel near the hospital.', 'medical', 'critical', 'reported', 9.0400, 7.5100, 'Asokoro, Abuja', '{}', 6, now() - interval '12 hours');

-- ============================================
-- 4. STATUS UPDATES (audit trail)
-- ============================================

-- Get report IDs by title for referencing
DO $$
DECLARE
  r_jabi UUID;
  r_garki UUID;
  r_idu UUID;
  r_ahmadu UUID;
  r_maitama UUID;
  r_wuse2 UUID;
  r_nyanya UUID;
  r_gwarinpa UUID;
  r_ceddi UUID;
  r_mpape UUID;
BEGIN
  SELECT id INTO r_jabi FROM public.reports WHERE title LIKE '%Jabi Lake%' LIMIT 1;
  SELECT id INTO r_garki FROM public.reports WHERE title LIKE '%Garki%' LIMIT 1;
  SELECT id INTO r_idu FROM public.reports WHERE title LIKE '%Idu Railway%' LIMIT 1;
  SELECT id INTO r_ahmadu FROM public.reports WHERE title LIKE '%Ahmadu Bello%' LIMIT 1;
  SELECT id INTO r_maitama FROM public.reports WHERE title LIKE '%Maitama Park%' LIMIT 1;
  SELECT id INTO r_wuse2 FROM public.reports WHERE title LIKE '%Wuse II%' LIMIT 1;
  SELECT id INTO r_nyanya FROM public.reports WHERE title LIKE '%Nyanya%' LIMIT 1;
  SELECT id INTO r_gwarinpa FROM public.reports WHERE title LIKE '%Gwarinpa%' LIMIT 1;
  SELECT id INTO r_ceddi FROM public.reports WHERE title LIKE '%Ceddi Plaza%' LIMIT 1;
  SELECT id INTO r_mpape FROM public.reports WHERE title LIKE '%Mpape%' LIMIT 1;

  -- Jabi Lake: reported -> acknowledged
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at)
  VALUES (r_jabi, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'AEPB has been notified. Investigation team dispatched.', now() - interval '38 days');

  -- Garki: reported -> acknowledged -> in_progress
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at) VALUES
  (r_garki, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'Hazmat team alerted. Area cordoned off.', now() - interval '33 days'),
  (r_garki, 'a0000000-0000-0000-0000-000000000002', 'acknowledged', 'in_progress', 'Cleanup crew on site. Specialized disposal in progress.', now() - interval '30 days');

  -- Idu: reported -> acknowledged
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at)
  VALUES (r_idu, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'Environmental agency notified. Chemical analysis pending.', now() - interval '25 days');

  -- Ahmadu Bello: reported -> acknowledged -> cleanup_scheduled
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at) VALUES
  (r_ahmadu, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'FCDA construction waste team notified.', now() - interval '24 days'),
  (r_ahmadu, 'a0000000-0000-0000-0000-000000000001', 'acknowledged', 'cleanup_scheduled', 'Cleanup scheduled for next week. Heavy equipment arranged.', now() - interval '22 days');

  -- Maitama: reported -> acknowledged -> cleanup_scheduled -> in_progress -> resolved
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at) VALUES
  (r_maitama, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'Community volunteers have offered to help.', now() - interval '50 days'),
  (r_maitama, 'a0000000-0000-0000-0000-000000000001', 'acknowledged', 'cleanup_scheduled', 'Cleanup event organized for Saturday.', now() - interval '47 days'),
  (r_maitama, 'a0000000-0000-0000-0000-000000000001', 'cleanup_scheduled', 'in_progress', 'Cleanup underway with 15 volunteers!', now() - interval '45 days'),
  (r_maitama, 'a0000000-0000-0000-0000-000000000001', 'in_progress', 'resolved', 'Area completely cleaned. 2 truckloads of waste removed.', now() - interval '44 days');

  -- Wuse II: reported -> acknowledged -> resolved
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at) VALUES
  (r_wuse2, 'a0000000-0000-0000-0000-000000000003', 'reported', 'acknowledged', 'E-waste recyclers contacted.', now() - interval '16 days'),
  (r_wuse2, 'a0000000-0000-0000-0000-000000000003', 'acknowledged', 'resolved', 'All e-waste collected and sent to certified recyclers.', now() - interval '12 days');

  -- Nyanya: reported -> acknowledged
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at)
  VALUES (r_nyanya, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'NESREA has been contacted. Factory inspection scheduled.', now() - interval '12 days');

  -- Gwarinpa: reported -> in_progress
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at) VALUES
  (r_gwarinpa, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'Water board notified. Emergency repair requested.', now() - interval '7 days'),
  (r_gwarinpa, 'a0000000-0000-0000-0000-000000000002', 'acknowledged', 'in_progress', 'Repair crew on site. Pipe replacement in progress.', now() - interval '5 days');

  -- Ceddi: reported -> cleanup_scheduled
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at) VALUES
  (r_ceddi, 'a0000000-0000-0000-0000-000000000001', 'reported', 'acknowledged', 'Restaurant owners warned. Proper bins to be provided.', now() - interval '6 days'),
  (r_ceddi, 'a0000000-0000-0000-0000-000000000001', 'acknowledged', 'cleanup_scheduled', 'Waste collection service arranged for weekly pickup.', now() - interval '4 days');

  -- Mpape: reported -> acknowledged
  INSERT INTO public.status_updates (report_id, changed_by, old_status, new_status, comment, created_at)
  VALUES (r_mpape, 'a0000000-0000-0000-0000-000000000002', 'reported', 'acknowledged', 'Environmental protection agency reviewing. Samples collected.', now() - interval '2 days');

END $$;

-- ============================================
-- 5. EVENTS
-- ============================================

INSERT INTO public.events (organizer_id, title, description, event_date, start_time, end_time, latitude, longitude, address, status, max_attendees, tools_provided, tools_needed, report_ids, photo_urls, created_at) VALUES

-- Completed event (Maitama cleanup)
('a0000000-0000-0000-0000-000000000001', 'Maitama Park Community Cleanup', 'Join us to clean up the illegal dumpsite at Maitama District Park. All volunteers welcome! We will provide bags and gloves.', (now() - interval '45 days')::date, '08:00', '12:00', 9.0800, 7.4800, 'Maitama District Park, Abuja', 'completed', 30, 'Trash bags, gloves, hand sanitizer', 'Rakes, wheelbarrows', '{}', '{}', now() - interval '50 days'),

-- Completed event (Wuse II e-waste)
('a0000000-0000-0000-0000-000000000003', 'Wuse II E-Waste Collection Drive', 'Bring your old electronics for responsible recycling. Partnering with certified e-waste handlers.', (now() - interval '12 days')::date, '09:00', '15:00', 9.0650, 7.4700, 'Wuse II Shopping Complex, Abuja', 'completed', 50, 'Collection bins, labels, transport', 'None - just bring your e-waste!', '{}', '{}', now() - interval '20 days'),

-- Upcoming event
('a0000000-0000-0000-0000-000000000002', 'Kubwa Drainage Cleanup', 'Help clear the plastic waste from Kubwa drainage channels to prevent flooding this rainy season.', (now() + interval '10 days')::date, '07:00', '11:00', 9.1300, 7.3250, 'Kubwa Phase 4, Abuja', 'upcoming', 25, 'Gloves, boots, trash bags', 'Shovels, rakes', '{}', '{}', now() - interval '5 days'),

-- Upcoming event
('a0000000-0000-0000-0000-000000000004', 'Garki Hazardous Waste Awareness Walk', 'Awareness walk to highlight the medical waste problem in Garki. Media and officials invited.', (now() + interval '15 days')::date, '10:00', '13:00', 9.0350, 7.4900, 'Garki Area 11, Abuja', 'upcoming', 100, 'Banners, flyers, water', 'Megaphone, camera', '{}', '{}', now() - interval '3 days'),

-- In-progress event
('a0000000-0000-0000-0000-000000000001', 'Gwarinpa Estate Green Week', 'Week-long cleanup and tree planting initiative in Gwarinpa Estate. Different zones each day.', (now() - interval '1 day')::date, '08:00', '16:00', 9.1050, 7.4100, 'Gwarinpa Estate Main Gate, Abuja', 'in_progress', 40, 'Seedlings, compost, tools', 'Wheelbarrows, watering cans', '{}', '{}', now() - interval '8 days'),

-- Cancelled event
('a0000000-0000-0000-0000-000000000005', 'Lugbe Tire Cleanup', 'Cleanup of the tire dump near Lugbe. Postponed due to logistics.', (now() - interval '3 days')::date, '08:00', '12:00', 8.9800, 7.3800, 'Lugbe, Airport Road, Abuja', 'cancelled', 20, 'Truck, gloves', 'Heavy lifting volunteers', '{}', '{}', now() - interval '10 days');

-- ============================================
-- 6. EVENT ATTENDEES
-- ============================================

DO $$
DECLARE
  e_maitama UUID;
  e_wuse2 UUID;
  e_kubwa UUID;
  e_garki UUID;
  e_gwarinpa UUID;
BEGIN
  SELECT id INTO e_maitama FROM public.events WHERE title LIKE '%Maitama%' LIMIT 1;
  SELECT id INTO e_wuse2 FROM public.events WHERE title LIKE '%Wuse II%' LIMIT 1;
  SELECT id INTO e_kubwa FROM public.events WHERE title LIKE '%Kubwa%' LIMIT 1;
  SELECT id INTO e_garki FROM public.events WHERE title LIKE '%Garki%' LIMIT 1;
  SELECT id INTO e_gwarinpa FROM public.events WHERE title LIKE '%Gwarinpa%' LIMIT 1;

  -- Maitama (completed) - multiple attendees
  INSERT INTO public.event_attendees (event_id, user_id, status, created_at) VALUES
  (e_maitama, 'a0000000-0000-0000-0000-000000000002', 'going', now() - interval '49 days'),
  (e_maitama, 'a0000000-0000-0000-0000-000000000003', 'going', now() - interval '48 days'),
  (e_maitama, 'a0000000-0000-0000-0000-000000000004', 'going', now() - interval '48 days'),
  (e_maitama, 'a0000000-0000-0000-0000-000000000005', 'interested', now() - interval '47 days');

  -- Wuse II (completed)
  INSERT INTO public.event_attendees (event_id, user_id, status, created_at) VALUES
  (e_wuse2, 'a0000000-0000-0000-0000-000000000001', 'going', now() - interval '18 days'),
  (e_wuse2, 'a0000000-0000-0000-0000-000000000004', 'going', now() - interval '17 days'),
  (e_wuse2, 'a0000000-0000-0000-0000-000000000006', 'going', now() - interval '16 days'),
  (e_wuse2, 'a0000000-0000-0000-0000-000000000007', 'interested', now() - interval '15 days');

  -- Kubwa (upcoming) - RSVPs
  INSERT INTO public.event_attendees (event_id, user_id, status, created_at) VALUES
  (e_kubwa, 'a0000000-0000-0000-0000-000000000001', 'going', now() - interval '4 days'),
  (e_kubwa, 'a0000000-0000-0000-0000-000000000003', 'going', now() - interval '4 days'),
  (e_kubwa, 'a0000000-0000-0000-0000-000000000005', 'going', now() - interval '3 days'),
  (e_kubwa, 'a0000000-0000-0000-0000-000000000006', 'interested', now() - interval '3 days'),
  (e_kubwa, 'a0000000-0000-0000-0000-000000000007', 'going', now() - interval '2 days'),
  (e_kubwa, 'a0000000-0000-0000-0000-000000000008', 'interested', now() - interval '1 day');

  -- Garki awareness (upcoming)
  INSERT INTO public.event_attendees (event_id, user_id, status, created_at) VALUES
  (e_garki, 'a0000000-0000-0000-0000-000000000001', 'going', now() - interval '2 days'),
  (e_garki, 'a0000000-0000-0000-0000-000000000002', 'going', now() - interval '2 days'),
  (e_garki, 'a0000000-0000-0000-0000-000000000003', 'going', now() - interval '1 day'),
  (e_garki, 'a0000000-0000-0000-0000-000000000005', 'interested', now() - interval '1 day'),
  (e_garki, 'a0000000-0000-0000-0000-000000000006', 'going', now() - interval '12 hours'),
  (e_garki, 'a0000000-0000-0000-0000-000000000008', 'going', now() - interval '6 hours');

  -- Gwarinpa green week (in-progress)
  INSERT INTO public.event_attendees (event_id, user_id, status, created_at) VALUES
  (e_gwarinpa, 'a0000000-0000-0000-0000-000000000002', 'going', now() - interval '6 days'),
  (e_gwarinpa, 'a0000000-0000-0000-0000-000000000004', 'going', now() - interval '5 days'),
  (e_gwarinpa, 'a0000000-0000-0000-0000-000000000006', 'going', now() - interval '5 days'),
  (e_gwarinpa, 'a0000000-0000-0000-0000-000000000007', 'going', now() - interval '4 days'),
  (e_gwarinpa, 'a0000000-0000-0000-0000-000000000008', 'interested', now() - interval '3 days');

END $$;

-- ============================================
-- 7. POINT TRANSACTIONS (history for key actions)
-- ============================================

INSERT INTO public.point_transactions (user_id, action, points, created_at) VALUES
-- Admin
('a0000000-0000-0000-0000-000000000001', 'report_created', 10, now() - interval '55 days'),
('a0000000-0000-0000-0000-000000000001', 'report_created', 10, now() - interval '40 days'),
('a0000000-0000-0000-0000-000000000001', 'event_created', 15, now() - interval '50 days'),
('a0000000-0000-0000-0000-000000000001', 'event_completed', 25, now() - interval '44 days'),
('a0000000-0000-0000-0000-000000000001', 'event_created', 15, now() - interval '8 days'),
-- Authority
('a0000000-0000-0000-0000-000000000002', 'report_created', 10, now() - interval '42 days'),
('a0000000-0000-0000-0000-000000000002', 'report_created', 10, now() - interval '35 days'),
('a0000000-0000-0000-0000-000000000002', 'report_created', 10, now() - interval '28 days'),
('a0000000-0000-0000-0000-000000000002', 'event_created', 15, now() - interval '5 days'),
-- Chidi
('a0000000-0000-0000-0000-000000000003', 'report_created', 10, now() - interval '26 days'),
('a0000000-0000-0000-0000-000000000003', 'report_created', 10, now() - interval '20 days'),
('a0000000-0000-0000-0000-000000000003', 'report_created', 10, now() - interval '10 days'),
('a0000000-0000-0000-0000-000000000003', 'event_created', 15, now() - interval '20 days'),
('a0000000-0000-0000-0000-000000000003', 'event_completed', 25, now() - interval '12 days'),
-- Amina
('a0000000-0000-0000-0000-000000000004', 'report_created', 10, now() - interval '18 days'),
('a0000000-0000-0000-0000-000000000004', 'report_created', 10, now() - interval '15 days'),
('a0000000-0000-0000-0000-000000000004', 'report_created', 10, now() - interval '8 days'),
('a0000000-0000-0000-0000-000000000004', 'event_created', 15, now() - interval '3 days'),
-- Emeka
('a0000000-0000-0000-0000-000000000005', 'report_created', 10, now() - interval '12 days'),
('a0000000-0000-0000-0000-000000000005', 'report_created', 10, now() - interval '9 days'),
-- Halima
('a0000000-0000-0000-0000-000000000006', 'report_created', 10, now() - interval '7 days'),
('a0000000-0000-0000-0000-000000000006', 'report_created', 10, now() - interval '5 days'),
-- Tunde
('a0000000-0000-0000-0000-000000000007', 'report_created', 10, now() - interval '4 days'),
('a0000000-0000-0000-0000-000000000007', 'report_created', 10, now() - interval '3 days'),
-- Ngozi
('a0000000-0000-0000-0000-000000000008', 'report_created', 10, now() - interval '1 day'),
('a0000000-0000-0000-0000-000000000008', 'report_created', 10, now() - interval '12 hours');

-- ============================================
-- 7. REWARDS CATALOG
-- ============================================

INSERT INTO public.rewards (id, name, description, category, point_cost, provider, is_active, stock, tier_required)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'MTN N100 Airtime', 'Get N100 MTN airtime top-up', 'airtime', 100, 'vtpass', true, NULL, NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Airtel N200 Airtime', 'Get N200 Airtel airtime top-up', 'airtime', 200, 'vtpass', true, NULL, NULL),
  ('b0000000-0000-0000-0000-000000000003', 'MTN 500MB Data', 'Get 500MB MTN data bundle', 'data', 200, 'vtpass', true, NULL, NULL),
  ('b0000000-0000-0000-0000-000000000004', 'MTN 1GB Data', 'Get 1GB MTN data bundle', 'data', 400, 'vtpass', true, NULL, NULL),
  ('b0000000-0000-0000-0000-000000000005', 'Glo 2GB Data', 'Get 2GB Glo data bundle', 'data', 700, 'vtpass', true, NULL, 'eco_warrior'),
  ('b0000000-0000-0000-0000-000000000006', 'N500 Bank Transfer', 'Get N500 transferred to your bank account', 'bank_transfer', 500, 'paystack', true, NULL, 'eco_warrior'),
  ('b0000000-0000-0000-0000-000000000007', 'N1000 Bank Transfer', 'Get N1000 transferred to your bank account', 'bank_transfer', 1000, 'paystack', true, NULL, 'clean_champion'),
  ('b0000000-0000-0000-0000-000000000008', 'N2000 Jumia Gift Card', 'Get a N2000 Jumia shopping voucher', 'gift_card', 2000, 'manual', true, 50, 'clean_champion'),
  ('b0000000-0000-0000-0000-000000000009', 'WasteMapNaija T-Shirt', 'Official WasteMapNaija branded t-shirt', 'merchandise', 1500, 'manual', true, 20, 'eco_warrior'),
  ('b0000000-0000-0000-0000-000000000010', 'N500 Electricity Bill', 'Pay N500 towards your electricity bill', 'utility', 500, 'vtpass', true, NULL, NULL);

-- ============================================
-- 8. CHALLENGES
-- ============================================

INSERT INTO public.challenges (id, title, description, action_type, target_count, bonus_points, start_date, end_date, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Weekly Reporter', 'Submit 5 waste reports this week', 'report_created', 5, 50, CURRENT_DATE - interval '1 day', CURRENT_DATE + interval '6 days', true),
  ('c0000000-0000-0000-0000-000000000002', 'Photo Documenter', 'Upload photos with 3 reports', 'photos_uploaded', 3, 30, CURRENT_DATE - interval '1 day', CURRENT_DATE + interval '13 days', true),
  ('c0000000-0000-0000-0000-000000000003', 'Community Organizer', 'Create a cleanup event', 'event_created', 1, 25, CURRENT_DATE - interval '1 day', CURRENT_DATE + interval '29 days', true),
  ('c0000000-0000-0000-0000-000000000004', 'Event Goer', 'Attend 2 cleanup events', 'event_attended', 2, 40, CURRENT_DATE - interval '1 day', CURRENT_DATE + interval '29 days', true),
  ('c0000000-0000-0000-0000-000000000005', 'Upvote Champion', 'Upvote 10 reports from other users', 'upvoted_report', 10, 20, CURRENT_DATE - interval '1 day', CURRENT_DATE + interval '6 days', true);

-- ============================================
-- 9. REFERRAL CODES FOR DEMO USERS
-- ============================================

UPDATE public.profiles SET referral_code = 'ADMIN001' WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET referral_code = 'AUTH0002' WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET referral_code = 'CHIDI003' WHERE id = 'a0000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET referral_code = 'AMINA004' WHERE id = 'a0000000-0000-0000-0000-000000000004';

-- ============================================
-- 10. UPDATE TIERS BASED ON CURRENT POINTS
-- ============================================

SELECT public.update_user_tier(id) FROM public.profiles;

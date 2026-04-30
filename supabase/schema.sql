-- ============================================================
-- Emprending Hub 2026 — Schema SQL para Supabase
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Participants (one row per registered entrepreneur)
CREATE TABLE participants (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,
  startup_name    text NOT NULL,
  email           text NOT NULL UNIQUE,
  diagnostic      jsonb,                    -- { stage, problem, sector }
  created_at      timestamptz DEFAULT now()
);

-- Mentors (seed with mentors.json data)
CREATE TABLE mentors (
  id              serial PRIMARY KEY,
  name            text NOT NULL,
  role_company    text,
  bio             text,
  specialty_tags  text[],
  linkedin_url    text,
  photo_url       text,
  max_capacity    int DEFAULT 5
);

-- Bookings: up to 7 per participant, unique per (participant, mentor)
CREATE TABLE bookings (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id  uuid REFERENCES participants(id) ON DELETE CASCADE,
  mentor_id       int REFERENCES mentors(id),
  topics          text[] DEFAULT '{}',         -- selected topics for this booking
  notes           text,                         -- free-text from participant
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT unique_participant_mentor UNIQUE (participant_id, mentor_id)
);

-- Feedback: collected via QR after each class
CREATE TABLE feedback (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_label   text,
  participant_name text,
  rating          int CHECK (rating BETWEEN 1 AND 5),
  comment         text,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Views
-- ============================================================

-- Real-time availability per mentor (count-based, no race conditions)
CREATE VIEW mentor_availability AS
SELECT
  m.id,
  m.name,
  m.max_capacity,
  COUNT(b.id)::int                            AS booked_spots,
  (m.max_capacity - COUNT(b.id)::int)         AS available_spots,
  (COUNT(b.id) >= m.max_capacity)             AS is_full
FROM mentors m
LEFT JOIN bookings b ON b.mentor_id = m.id
GROUP BY m.id;

-- Staff overview: participants with their selected mentors
CREATE VIEW staff_overview AS
SELECT
  p.id,
  p.name,
  p.startup_name,
  p.email,
  p.diagnostic,
  p.created_at,
  array_agg(m.name ORDER BY b.created_at) FILTER (WHERE m.name IS NOT NULL) AS selected_mentors,
  COUNT(b.id)::int                                                            AS mentor_count
FROM participants p
LEFT JOIN bookings b ON b.participant_id = p.id
LEFT JOIN mentors m ON m.id = b.mentor_id
GROUP BY p.id;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Mentors: public read
CREATE POLICY "mentors_public_read" ON mentors FOR SELECT USING (true);

-- Participants: public insert, no read (staff reads via service_role)
CREATE POLICY "participants_public_insert" ON participants FOR INSERT WITH CHECK (true);

-- Bookings: public insert and select (needed for availability count)
CREATE POLICY "bookings_public_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_public_select" ON bookings FOR SELECT USING (true);

-- Feedback: public insert
CREATE POLICY "feedback_public_insert" ON feedback FOR INSERT WITH CHECK (true);

-- ============================================================
-- Enable Realtime on bookings table
-- ============================================================
-- Run this in the Supabase Dashboard → Database → Replication
-- or via the API. The SQL equivalent:
-- ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

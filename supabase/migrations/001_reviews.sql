-- ============================================================
-- Reviews table — stores customer reviews with moderation
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT 'General',
  date_of_service DATE,                        -- optional: when the service happened
  staff_id UUID REFERENCES staff(id),          -- optional: which staff member
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_staff_id ON reviews(staff_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public/anon: can INSERT new submissions only
CREATE POLICY "Anyone can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Public/anon: can SELECT published reviews only
CREATE POLICY "Anyone can read published reviews"
  ON reviews FOR SELECT
  USING (status = 'published');

-- Authenticated admin: full read access (all statuses)
CREATE POLICY "Authenticated users can read all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated admin: can UPDATE status (publish/archive)
CREATE POLICY "Authenticated users can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated admin: can DELETE reviews
CREATE POLICY "Authenticated users can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- ============================================================
-- Seed: hardcoded reviews from the frontend with status = published
-- ============================================================
INSERT INTO reviews (name, rating, text, service, status, created_at) VALUES
  (
    'Tanya M.',
    5,
    'Best nail shop in Scarborough, hands down. My Bio-Gel set lasted 3 weeks with zero lifting. The staff are so friendly and patient with designs.',
    'Bio-Gel Fullset',
    'published',
    '2026-02-15T12:00:00Z'
  ),
  (
    'Priya S.',
    5,
    'Walk-in on a Saturday and they got me in within 15 minutes. Great mani-pedi, very clean, fair prices. I keep coming back!',
    'Mani-Pedi',
    'published',
    '2026-01-20T12:00:00Z'
  ),
  (
    'Keisha R.',
    5,
    'I drove from Brampton for these nails and it was worth it. The nail art is incredible and the price is so reasonable compared to downtown shops.',
    'Acrylic + Nail Art',
    'published',
    '2026-01-10T12:00:00Z'
  );

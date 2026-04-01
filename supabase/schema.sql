-- ============================================================
-- MK Fashion Nails & Spa — Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Services table (replaces hardcoded data in components/services.tsx)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price_display TEXT NOT NULL,       -- display string, e.g. "$35 & Up"
  price_min INTEGER NOT NULL,        -- base price in cents for calculation
  duration_minutes INTEGER,          -- estimated duration (nullable)
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  staff_id UUID REFERENCES staff(id),              -- optional preferred staff
  confirmation_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  estimated_total INTEGER NOT NULL,  -- cents
  deposit_amount INTEGER,            -- cents, nullable — future Stripe integration
  notes TEXT,
  sample_image_paths TEXT[] NOT NULL DEFAULT '{}',  -- storage paths for reference images
  booking_time TIMESTAMPTZ NOT NULL, -- customer's expected arrival time
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Booking ↔ Services junction table (many-to-many)
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  price_at_booking INTEGER NOT NULL  -- snapshot price in cents at time of booking
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(active);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation_token ON bookings(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(active, sort_order);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Services: public read (active only), authenticated full access
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active services"
  ON services FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff: public read (active only, needed for booking form), authenticated full access
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active staff"
  ON staff FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can manage staff"
  ON staff FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Customers: anon insert (booking form), authenticated read
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bookings: anon insert, public select (for confirmation page), authenticated full
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Booking Services: follows booking access pattern
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert booking_services"
  ON booking_services FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read booking_services"
  ON booking_services FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage booking_services"
  ON booking_services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6. App Settings table (key-value for configurable values)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage app_settings"
  ON app_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Migration: Add deposit columns to bookings
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_image_path TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_uploaded_at TIMESTAMPTZ;

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

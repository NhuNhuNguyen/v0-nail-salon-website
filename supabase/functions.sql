-- ============================================================
-- Function: get_todays_bookings
-- Returns today's bookings with customer & service details.
-- Run this in the Supabase SQL Editor after schema.sql & seed.sql.
-- ============================================================

CREATE OR REPLACE FUNCTION get_todays_bookings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.booking_time ASC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT
      b.id,
      b.customer_id,
      b.confirmation_token,
      b.status,
      b.estimated_total,
      b.deposit_amount,
      b.deposit_image_path,
      b.deposit_uploaded_at,
      b.notes,
      b.sample_image_paths,
      b.staff_id,
      b.booking_time,
      b.created_at,
      jsonb_build_object(
        'name', c.name,
        'phone', c.phone
      ) AS customer,
      CASE WHEN st.id IS NOT NULL
        THEN jsonb_build_object('id', st.id, 'name', st.name)
        ELSE NULL
      END AS staff,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', bs.id,
              'booking_id', bs.booking_id,
              'service_id', bs.service_id,
              'price_at_booking', bs.price_at_booking,
              'service', jsonb_build_object(
                'name', s.name,
                'category', s.category,
                'price_display', s.price_display
              )
            )
          )
          FROM booking_services bs
          JOIN services s ON s.id = bs.service_id
          WHERE bs.booking_id = b.id
        ),
        '[]'::jsonb
      ) AS booking_services
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    LEFT JOIN staff st ON st.id = b.staff_id
    WHERE b.booking_time::date = CURRENT_DATE
    ORDER BY b.booking_time ASC
  ) t;

  RETURN result;
END;
$$;

-- ============================================================
-- Function: get_bookings_by_range
-- Returns bookings within a date range with customer & service details.
-- ============================================================

CREATE OR REPLACE FUNCTION get_bookings_by_range(start_date DATE, end_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.booking_time ASC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT
      b.id,
      b.customer_id,
      b.confirmation_token,
      b.status,
      b.estimated_total,
      b.deposit_amount,
      b.deposit_image_path,
      b.deposit_uploaded_at,
      b.notes,
      b.sample_image_paths,
      b.staff_id,
      b.booking_time,
      b.created_at,
      jsonb_build_object(
        'name', c.name,
        'phone', c.phone
      ) AS customer,
      CASE WHEN st.id IS NOT NULL
        THEN jsonb_build_object('id', st.id, 'name', st.name)
        ELSE NULL
      END AS staff,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', bs.id,
              'booking_id', bs.booking_id,
              'service_id', bs.service_id,
              'price_at_booking', bs.price_at_booking,
              'service', jsonb_build_object(
                'name', s.name,
                'category', s.category,
                'price_display', s.price_display
              )
            )
          )
          FROM booking_services bs
          JOIN services s ON s.id = bs.service_id
          WHERE bs.booking_id = b.id
        ),
        '[]'::jsonb
      ) AS booking_services
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    LEFT JOIN staff st ON st.id = b.staff_id
    WHERE b.booking_time::date >= start_date
      AND b.booking_time::date <= end_date
    ORDER BY b.booking_time ASC
  ) t;

  RETURN result;
END;
$$;

-- ============================================================
-- pg_cron: Schedule daily cleanup of expired booking images
-- Requires pg_cron and pg_net extensions (enable in Supabase Dashboard → Extensions).
-- Update <project-ref> with your actual Supabase project reference before running.
-- ============================================================

-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- SELECT cron.schedule(
--   'cleanup-booking-images',
--   '0 4 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://<project-ref>.supabase.co/functions/v1/cleanup-booking-images',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- ============================================================
-- Function: get_bookings_paginated
-- Returns paginated bookings with filters.
-- ============================================================

CREATE OR REPLACE FUNCTION get_bookings_paginated(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_customer_search TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_staff_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total INTEGER;
  v_offset INTEGER;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  -- Get total count
  SELECT COUNT(*)
  INTO total
  FROM bookings b
  JOIN customers c ON c.id = b.customer_id
  WHERE (p_start_date IS NULL OR b.booking_time::date >= p_start_date)
    AND (p_end_date IS NULL OR b.booking_time::date <= p_end_date)
    AND (p_customer_search IS NULL OR p_customer_search = '' OR
         c.name ILIKE '%' || p_customer_search || '%' OR
         c.phone ILIKE '%' || p_customer_search || '%')
    AND (p_category IS NULL OR p_category = '' OR EXISTS (
      SELECT 1 FROM booking_services bs
      JOIN services s ON s.id = bs.service_id
      WHERE bs.booking_id = b.id AND s.category = p_category
    ))
    AND (p_staff_id IS NULL OR b.staff_id = p_staff_id)
    AND (p_status IS NULL OR p_status = '' OR b.status = p_status);

  -- Get paginated data
  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT
      b.id,
      b.customer_id,
      b.confirmation_token,
      b.status,
      b.estimated_total,
      b.deposit_amount,
      b.deposit_image_path,
      b.deposit_uploaded_at,
      b.notes,
      b.sample_image_paths,
      b.staff_id,
      b.booking_time,
      b.created_at,
      jsonb_build_object(
        'name', c.name,
        'phone', c.phone
      ) AS customer,
      CASE WHEN st.id IS NOT NULL
        THEN jsonb_build_object('id', st.id, 'name', st.name)
        ELSE NULL
      END AS staff,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', bs.id,
              'booking_id', bs.booking_id,
              'service_id', bs.service_id,
              'price_at_booking', bs.price_at_booking,
              'service', jsonb_build_object(
                'name', s.name,
                'category', s.category,
                'price_display', s.price_display
              )
            )
          )
          FROM booking_services bs
          JOIN services s ON s.id = bs.service_id
          WHERE bs.booking_id = b.id
        ),
        '[]'::jsonb
      ) AS booking_services
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    LEFT JOIN staff st ON st.id = b.staff_id
    WHERE (p_start_date IS NULL OR b.booking_time::date >= p_start_date)
      AND (p_end_date IS NULL OR b.booking_time::date <= p_end_date)
      AND (p_customer_search IS NULL OR p_customer_search = '' OR
           c.name ILIKE '%' || p_customer_search || '%' OR
           c.phone ILIKE '%' || p_customer_search || '%')
      AND (p_category IS NULL OR p_category = '' OR EXISTS (
        SELECT 1 FROM booking_services bs2
        JOIN services s2 ON s2.id = bs2.service_id
        WHERE bs2.booking_id = b.id AND s2.category = p_category
      ))
      AND (p_staff_id IS NULL OR b.staff_id = p_staff_id)
      AND (p_status IS NULL OR p_status = '' OR b.status = p_status)
    ORDER BY b.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) t;

  RETURN jsonb_build_object(
    'data', result,
    'total_count', total
  );
END;
$$;

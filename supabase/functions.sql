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

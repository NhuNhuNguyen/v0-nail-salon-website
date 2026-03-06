-- ============================================================
-- MK Fashion Nails & Spa — Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- Acrylic Nails (sort_order 100–199)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('Acrylic Nails', 'Fullset Acrylic', '$35 & Up', 3500, 60, 100),
  ('Acrylic Nails', 'Refill Acrylic', '$30 & Up', 3000, 45, 101);

-- UV Gel (sort_order 200–299)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('UV Gel', 'Fullset UV Gel', '$50 & Up', 5000, 75, 200),
  ('UV Gel', 'Refill UV Gel', '$40 & Up', 4000, 60, 201);

-- Bio-Gel (sort_order 300–399)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('Bio-Gel', 'Fullset Biogel', '$60 & Up', 6000, 75, 300),
  ('Bio-Gel', 'Refill Biogel', '$50 & Up', 5000, 60, 301);

-- Manicure & Pedicure (sort_order 400–499)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('Manicure & Pedicure', 'Manicure', '$25 - $35', 2500, 30, 400),
  ('Manicure & Pedicure', 'Pedicure', '$35 - $45', 3500, 45, 401),
  ('Manicure & Pedicure', 'Mani-Pedi', '$55 - $75', 5500, 75, 402),
  ('Manicure & Pedicure', 'Nail Pedicure', '$5 Each', 500, 15, 403);

-- Nail Extras (sort_order 500–599)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('Nail Extras', 'Nail Take Off', '$10', 1000, 15, 500),
  ('Nail Extras', 'Nail Art Designs', '$10 & Up', 1000, 20, 501),
  ('Nail Extras', 'White Tip', '$15 & Up', 1500, 15, 502),
  ('Nail Extras', 'Cut Down', '$5', 500, 10, 503),
  ('Nail Extras', 'Polish Change', '$10 & Up', 1000, 15, 504);

-- Facial & Eyes (sort_order 600–699)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('Facial & Eyes', 'Facial', '$60 & Up', 6000, 60, 600),
  ('Facial & Eyes', 'Eyelash Extension', '$45 - $100+', 4500, 90, 601),
  ('Facial & Eyes', 'Threading', '$10', 1000, 15, 602);

-- Face Waxing (sort_order 700–799)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('Face Waxing', 'Eye Brow', '$10 & Up', 1000, 10, 700),
  ('Face Waxing', 'Full Face', '$30 & Up', 3000, 30, 701),
  ('Face Waxing', 'Upper Lip', '$5 & Up', 500, 10, 702),
  ('Face Waxing', 'Chin', '$10 & Up', 1000, 10, 703);

-- Body Waxing (sort_order 800–899)
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order) VALUES
  ('Body Waxing', 'Half Arm', '$25 & Up', 2500, 20, 800),
  ('Body Waxing', 'Full Arm', '$35 & Up', 3500, 30, 801),
  ('Body Waxing', 'Underarm', '$15 & Up', 1500, 15, 802),
  ('Body Waxing', 'Stomach', '$20 & Up', 2000, 20, 803),
  ('Body Waxing', 'Back', '$30 & Up', 3000, 30, 804),
  ('Body Waxing', 'Bikini Line', '$25 & Up', 2500, 20, 805),
  ('Body Waxing', 'Brazilian', '$45 & Up', 4500, 30, 806),
  ('Body Waxing', 'Half Leg', '$35 & Up', 3500, 25, 807),
  ('Body Waxing', 'Full Leg', '$50 & Up', 5000, 40, 808);

-- Staff
INSERT INTO staff (name) VALUES
  ('Anna'),
  ('Bianca'),
  ('Christina'),
  ('Diana');

-- App Settings
INSERT INTO app_settings (key, value) VALUES
  ('deposit_amount', '{"cents": 2000}'),
  ('deposit_payment_info', '{"method": "Bank Transfer", "details": "Please send the deposit via e-Transfer to:\n\nEmail: payments@mkfashionnails.com\nName: MK Fashion Nails & Spa\n\nPlease include your booking name as the memo."}')
ON CONFLICT (key) DO NOTHING;

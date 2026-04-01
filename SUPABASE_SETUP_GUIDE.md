# 🗄️ Supabase Setup Guide - Complete Process

Follow these steps to properly configure your Supabase database so bookings work end-to-end.

---

## **STEP 1: Run Main Schema (CREATE TABLES)**

### Location in Supabase:
1. Go to [https://app.supabase.com](https://app.supabase.com) → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy and paste the **ENTIRE content** of `supabase/schema.sql`
5. Click **Run** (▶️ button)
6. Wait for completion ✅

**What it creates:**
- `services` table (nail services with pricing)
- `customers` table (booking customers)
- `staff` table (salon staff members)
- `bookings` table (booking records)
- `booking_services` (junction table - links bookings to services)
- `app_settings` table (configuration)
- Row Level Security policies (RLS)
- Database indexes

---

## **STEP 2: Add Reviews System**

### In SQL Editor:
1. Click **+ New Query**
2. Copy and paste the **ENTIRE content** of `supabase/migrations/001_reviews.sql`
3. Click **Run**

**What it creates:**
- `reviews` table
- RLS policies for reviews

---

## **STEP 3: Add Database Functions**

### In SQL Editor:
1. Click **+ New Query**
2. Copy and paste the **ENTIRE content** of `supabase/functions.sql`
3. Click **Run**

**What it creates:**
- `get_todays_bookings()` function (used by admin dashboard)
- Helper functions for booking queries

---

## **STEP 4: Seed Sample Data (OPTIONAL - First Time Only)**

### Add Test Staff & Services:
Create a new query and run this:

```sql
-- Insert sample staff members
INSERT INTO staff (name, active) VALUES
  ('Maria', true),
  ('Jessica', true),
  ('Sofia', true);

-- Insert sample services
INSERT INTO services (category, name, price_display, price_min, duration_minutes, sort_order, active) VALUES
  ('Manicures', 'Regular Manicure', '$25 & Up', 2500, 45, 1, true),
  ('Manicures', 'Gel Manicure', '$35 & Up', 3500, 60, 2, true),
  ('Manicures', 'Acrylic Nails', '$45 & Up', 4500, 75, 3, true),
  ('Pedicures', 'Regular Pedicure', '$30 & Up', 3000, 45, 4, true),
  ('Pedicures', 'Gel Pedicure', '$40 & Up', 4000, 60, 5, true),
  ('Pedicures', 'Acrylic Pedicure', '$50 & Up', 5000, 75, 6, true),
  ('Nail Extensions', 'Acrylic Extensions', '$50 & Up', 5000, 90, 7, true),
  ('Nail Extensions', 'Gel-X Nails', '$60 & Up', 6000, 90, 8, true),
  ('Nail Art', 'Simple Nail Art', '$35 & Up', 3500, 60, 9, true),
  ('Nail Art', 'Complex Nail Art', '$50 & Up', 5000, 90, 10, true);
```

---

## **STEP 5: Configure Authentication**

### Enable Email/Password Auth:
1. Click **Authentication** (left sidebar)
2. Click **Providers** tab
3. Find **Email** provider
4. Toggle it ON
5. Configure email settings if needed

### Create Admin User:
1. Click **Users** tab (under Authentication)
2. Click **Invite User** (or just create test user)
3. Enter email: `admin@example.com`
4. Set password: Something secure
5. Save it for later login

---

## **STEP 6: Configure Storage**

### Create `booking-images` Bucket:
1. Click **Storage** (left sidebar)
2. Click **+ New Bucket**
3. Name: `booking-images`
4. Privacy: **Public**
5. Create bucket

### Set RLS Policies for Storage:
1. Click **Policies** (on the bucket)
2. Click **+ New Policy** → **For Full customization**
3. Name: `Users can upload and read booking images`
4. Paste this:

```sql
SELECT CASE 
  WHEN auth.role() = 'authenticated' THEN true
  WHEN auth.role() = 'anon' THEN true
  ELSE false
END;
```

5. Click **Create**
6. Repeat for INSERT permission

---

## **STEP 7: Verify Everything Works**

### In Supabase Dashboard:
1. Click **SQL Editor**
2. Create a new query and run:

```sql
SELECT COUNT(*) as staff_count FROM staff;
SELECT COUNT(*) as services_count FROM services;
SELECT COUNT(*) as bookings_count FROM bookings;
```

✅ You should see:
- `staff_count`: 3 (if you ran seed)
- `services_count`: 10 (if you ran seed)
- `bookings_count`: 0 (initially empty)

---

## **STEP 8: Test Booking Flow Locally**

### Back in VS Code:

1. **Verify dev server is running:**
   ```
   pnpm dev
   ```
   Open http://localhost:3000

2. **Create a booking:**
   - Go to http://localhost:3000/booking
   - Fill out form (select service, date, time, staff)
   - Click **Submit**
   - You should get an error message OR a confirmation email

3. **Check Supabase for the booking:**
   - Go to SQL Editor
   - Run:
   ```sql
   SELECT * FROM bookings LIMIT 1;
   SELECT * FROM customers LIMIT 1;
   ```
   - You should see new records! ✅

4. **Test confirmation page:**
   - Get the `confirmation_token` from the booking
   - Go to: `http://localhost:3000/booking/confirm/[YOUR-TOKEN-HERE]`
   - Should see booking details ✅

---

## **STEP 9: Configure Admin Login**

### In Supabase:
1. Remember the admin email/password you created in **STEP 5**
2. Use these to login at http://localhost:3000/admin/login
3. You should see the admin dashboard ✅

---

## **Troubleshooting**

### ❌ "404 on confirmation page"
- **Fix:** Run `supabase/schema.sql` first (tables don't exist)

### ❌ "Booking form gives error"
- **Fix:** Make sure `customers` and `bookings` tables have INSERT policies
- Check RLS policies are created correctly

### ❌ "Can't upload images"
- **Fix:** Create `booking-images` storage bucket + RLS policies

### ❌ "Admin login doesn't work"
- **Fix:** Create admin user in Authentication → Users

---

## **Files to Run in Order**

1. ✅ `supabase/schema.sql` (creates all tables)
2. ✅ `supabase/migrations/001_reviews.sql` (adds reviews)
3. ✅ `supabase/functions.sql` (adds functions)
4. ✅ Seed data SQL (optional - test data)

**All in SQL Editor, one at a time, in this order.**

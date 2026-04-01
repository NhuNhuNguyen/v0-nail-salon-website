# 📧 Email Flow Testing Guide

This guide walks you through setting up and testing the email notification system for the MK Fashion Nails booking platform.

---

## **🎯 Email Flow Overview**

```
Customer submits booking
         ↓
Booking saved to database
         ↓
Staff notification email sent (Gmail)
         ↓
Admin dashboard updated in real-time
```

**Email is sent TO:** `STAFF_EMAIL` (configured in .env.local)
**Email is sent FROM:** `GMAIL_USER` (configured in .env.local)

---

## **⚙️ STEP 1: Setup Gmail App Password**

The email system uses **Gmail SMTP** with an **App Password** (not your regular Gmail password).

### **Why an App Password?**
- Your regular Gmail password won't work with SMTP
- App Passwords are more secure for external apps
- Gmail requires this for less secure connections

### **How to Generate:**

1. **Go to your Google Account:**
   - Open https://myaccount.google.com/
   - Click **Security** (left sidebar)

2. **Enable 2-Step Verification (if not enabled):**
   - Click **2-Step Verification**
   - Follow the steps
   - When done, come back to Security

3. **Generate App Password:**
   - Go back to https://myaccount.google.com/
   - Click **Security**
   - Scroll down to "App passwords"
   - Select: **Mail** → **Windows Computer** (or your device)
   - Click **Generate**
   - Copy the 16-character password

### **Add to .env.local:**

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
STAFF_EMAIL=abc@gmail.com
```

**⚠️ IMPORTANT:**
- Use the 16-character password from Google (with spaces or without - both work)
- This is NOT your regular Gmail password
- If you have 2FA, this is REQUIRED

---

## **🧪 STEP 2: Test Email System**

### **Method A: API Test Endpoint**

This is the quickest way to verify email is working.

**In your browser, go to:**
```
http://localhost:3000/api/test-email
```

**Or with curl:**
```bash
curl -X POST http://localhost:3000/api/test-email
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "emailInfo": {
    "from": "your-email@gmail.com",
    "to": "abc@gmail.com",
    "subject": "🧪 MK Nails Booking System - Email Test",
    "timestamp": "2026-04-01T10:30:00.000Z"
  },
  "instructions": [
    "Check your inbox (or spam folder)",
    "Email should arrive within 1-2 minutes",
    "If you don't receive it, check the console logs for errors"
  ]
}
```

**Check your inbox/spam folder** for the test email ✅

---

### **Method B: Monitor Dev Server Logs**

Keep an eye on your development server console for email activity:

```bash
pnpm dev
```

See logs like:
```
✅ Email sent successfully (attempt 1/3):
{
  to: 'abc@gmail.com',
  subject: '🧪 MK Nails Booking System - Email Test',
  messageId: '<ABC123@gmail.com>',
  response: '250 2.0.0 OK'
}
```

---

## **📝 STEP 3: Test Booking Email Flow**

This tests the complete booking flow with email notifications.

### **A. Fill Out Booking Form**

1. Go to http://localhost:3000/booking
2. Click **Fill Dummy Data** button (speeds up testing)
3. Fill additional fields:
   - Name: Test Customer
   - Phone: (647) 555-0123
   - Date: Tomorrow or any future date
   - Time: 10:00 AM
   - Services: Select at least one ✅
4. Click **Submit Booking**

### **B. Check Email Received**

1. **Check your inbox** (STAFF_EMAIL address)
2. **Look for:** Subject line: "📞 New Booking – Test Customer"
3. **Email should contain:**
   - ✅ Customer name
   - ✅ Phone number (clickable tel: link)
   - ✅ Booking date & time
   - ✅ Services requested
   - ✅ Estimated total
   - ✅ Booking reference ID
   - ✅ Link to Admin Dashboard

### **C. Check Server Logs**

In your dev server terminal, you should see:
```
✅ Email sent successfully (attempt 1/3):
{
  to: 'abc@gmail.com',
  subject: '📞 New Booking – Test Customer',
  messageId: '<XYZ789@gmail.com>'
}
```

### **D. Verify Booking Was Saved**

The booking should appear in:
1. **Supabase Table Editor** → bookings table
2. **Admin Dashboard** → http://localhost:3000/admin

---

## **🔍 STEP 4: Monitor & Debug**

### **Check Server Console**

Watch for these logs while testing:

**✅ SUCCESS:**
```
✅ Email sent successfully (attempt 1/3):
  to: 'abc@gmail.com'
  subject: '📞 New Booking – Test Customer'
  messageId: '<..@gmail.com>'
```

**❌ FAILURE:**
```
❌ Email send failed (attempt 1/3):
  to: 'abc@gmail.com'
  subject: '📞 New Booking – Test Customer'
  error: 'Invalid login: invalid user or password'
```

### **Common Errors & Fixes**

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid login: invalid user or password` | Wrong Gmail credentials | Verify GMAIL_USER and GMAIL_APP_PASSWORD are correct |
| `STAFF_EMAIL not configured` | Missing env variable | Add STAFF_EMAIL to .env.local |
| `Please log in with your app password` | Using regular password instead of app password | Generate App Password at https://myaccount.google.com/apppasswords |
| `5.7.8 Username and password not accepted` | 2FA not enabled or app password expired | Enable 2FA and regenerate app password |
| Email arrives in spam folder | Gmail trust issue | Mark as "Not Spam" to improve delivery |

---

## **📊 STEP 5: Verify Complete Email Workflow**

Use this checklist to confirm everything works:

### **Configuration ✅**
- [ ] GMAIL_USER is set in .env.local
- [ ] GMAIL_APP_PASSWORD is 16-character app password (not regular password)
- [ ] STAFF_EMAIL is set in .env.local
- [ ] NEXT_PUBLIC_APP_URL is http://localhost:3000 for local testing

### **Test Email ✅**
- [ ] POST /api/test-email returns success
- [ ] Test email arrives in inbox within 2 minutes
- [ ] Email contains correct "From" and styling

### **Booking Email ✅**
- [ ] Submit booking on /booking
- [ ] Booking email sent without errors
- [ ] Email contains all booking details
- [ ] Email has Admin Dashboard link
- [ ] Booking appears in database

### **Production Ready ✅**
- [ ] Emails work consistently
- [ ] No errors in server logs
- [ ] Response times are < 5 seconds
- [ ] Email templates render correctly

---

## **⚡ Quick Start for Testing**

```bash
# 1. Start dev server
pnpm dev

# 2. Test email system (in browser or terminal)
curl -X POST http://localhost:3000/api/test-email

# 3. Go to booking form
# http://localhost:3000/booking

# 4. Click "Fill Dummy Data"
# 5. Submit booking
# 6. Check email inbox
# 7. Check server console logs
```

---

## **📧 Email Templates**

### **Test Email**
- **Subject:** 🧪 MK Nails Booking System - Email Test
- **To:** STAFF_EMAIL
- **Purpose:** Verify email system is working

### **Booking Notification** 
- **Subject:** 📞 New Booking – [Customer Name]
- **To:** STAFF_EMAIL
- **Purpose:** Alert staff of new booking request
- **Content:** Customer details, phone, date/time, services, total

---

## **🚀 Production Deployment**

Before deploying to production:

1. **Update .env.production with real Gmail credentials**
   ```env
   GMAIL_USER=salon@yourdomain.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   STAFF_EMAIL=owner@yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **Test email system in production environment**
   ```
   POST https://yourdomain.com/api/test-email
   ```

3. **Monitor email delivery**
   - Check Gmail activity log at https://myaccount.google.com/device-activity
   - Monitor for failed sends in application logs

4. **Setup fallback notifications**
   - Optional: Add SMS fallback with Twilio (see TWILIO config in .env.local)

---

## **❓ Troubleshooting**

### **Email Not Arriving?**

1. **Check dev server logs:**
   ```
   pnpm dev
   # Look for ✅ or ❌ Email messages
   ```

2. **Verify .env.local:**
   ```bash
   # Open .env.local and confirm:
   GMAIL_USER=actual@gmail.com       # ✅ Should be real email
   GMAIL_APP_PASSWORD=xxxx...        # ✅ Should be 16 chars
   STAFF_EMAIL=staff@example.com     # ✅ Should be real email
   ```

3. **Check Gmail Security:**
   - Go to https://myaccount.google.com/security
   - Verify 2FA is enabled
   - Verify app password is fresh (regenerate if old)

4. **Check Spam Folder:**
   - Gmail marks new senders as spam
   - Mark as "Not Spam" to improve

5. **Test via API:**
   ```bash
   curl -X POST http://localhost:3000/api/test-email
   # Check response for detailed errors
   ```

### **"Invalid login" Error?**

99% of the time this is one of these:
- ❌ Using regular Gmail password (must use App Password)
- ❌ GMAIL_APP_PASSWORD has dashes/spaces (copy exactly from Google)
- ❌ Gmail account doesn't have 2FA enabled (enable it first)
- ❌ Wrong GMAIL_USER entered

### **"STAFF_EMAIL not configured"?**

Add this to .env.local:
```env
STAFF_EMAIL=your-email@gmail.com
```

---

## **📞 Manual Testing Checklist**

```
[ ] Generate Gmail App Password
[ ] Update .env.local with credentials
[ ] Restart dev server: pnpm dev
[ ] Test email endpoint: POST /api/test-email
[ ] Check inbox for test email
[ ] Go to /booking page
[ ] Fill "Fill Dummy Data" button
[ ] Submit booking
[ ] Check inbox for booking email
[ ] Verify all booking details in email
[ ] Check admin dashboard at /admin
[ ] Verify booking appears there too
[ ] Check server console for email logs
[ ] All checks passed ✅
```

---

## **📞 Support**

If emails still aren't working:

1. **Check console errors:** Look at `pnpm dev` output
2. **Enable debug mode:** Add more logging to see what's happening
3. **Test Gmail credentials separately:** Use the test-email endpoint
4. **Verify network:** Make sure your machine can reach Gmail SMTP servers
5. **Check firewall:** Some networks block SMTP port 587

---

**Now you're ready to test the complete email flow! 🚀**

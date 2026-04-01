# 📧 Email Flow - Complete Setup & Testing Guide

## 🎯 What Changed (Summary)

I've completely refactored the email system to use **Gmail SMTP** with proper error handling, logging, and testing utilities. Here's what you need to know:

---

## **✨ Key Updates**

### **1. New Email Service** [lib/email-service.ts]
- Professional email templates with better styling
- Automatic retry logic (3 attempts by default)
- Detailed logging for debugging
- Support for multiple email types

### **2. Updated Booking Actions** [app/booking/actions.ts]
- Now uses Gmail SMTP (configured in .env.local)
- Emails sent asynchronously (don't block booking)
- Proper error handling and logging
- No crashes if email fails

### **3. Test Email Endpoint** [app/api/test-email/route.ts]
- Quick way to verify email system works
- Detailed error messages if something fails
- Returns JSON with configuration status

### **4. Comprehensive Guides**
- [EMAIL_TESTING_GUIDE.md](EMAIL_TESTING_GUIDE.md) - Step-by-step testing
- Includes setup, troubleshooting, and production deployment info

---

## **🚀 QUICK START (5 Minutes)**

### **Step 1: Setup Gmail App Password**

**Why?** You can't use your regular Gmail password with SMTP. Gmail requires a special "App Password".

1. Go to: https://myaccount.google.com/apppasswords
2. Select: **Mail** → **Windows Computer** (or your device)
3. Click **Generate**
4. Copy the 16-character password

### **Step 2: Update .env.local**

Add/update these lines:

```env
GMAIL_USER=abc@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
STAFF_EMAIL=abc@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT:**
- `GMAIL_APP_PASSWORD` is the 16-char password from Google (NOT your regular Gmail password)
- Both GMAIL_USER and STAFF_EMAIL can be the same
- Don't commit .env.local to git!

### **Step 3: Restart Server & Test**

```bash
# Restart development server
pnpm dev
```

**Quick test:**
```bash
curl -X POST http://localhost:3000/api/test-email
```

Or just go to: http://localhost:3000/api/test-email in your browser

Check your inbox in 1-2 minutes ✅

---

## **📝 Email Flow Explanation (Step by Step)**

### **When Customer Books:**

```
1. Customer fills booking form
   ↓
2. Submit button clicked
   ↓
3. Form data sent to: app/booking/actions.ts (createBooking function)
   ↓
4. Booking saved to Supabase database
   ↓
5. Email notification triggered:
   - Service name: sendBookingNotification()
   - From: GMAIL_USER (your Gmail)
   - To: STAFF_EMAIL (salon owner)
   ↓
6. Email includes:
   - Customer name & phone
   - Date & time requested
   - Services booked
   - Estimated total
   - BookingID
   ↓
7. Staff receives email in inbox within 2 minutes
   ↓
8. Staff calls customer to confirm appointment
```

### **Email Content Example:**

```
📞 Subject: New Booking – John Doe

👤 Customer Name: John Doe
📱 Phone Number: (647) 555-0123
📅 Requested Date & Time: Tuesday, April 2, 2026 2:00 PM
💅 Services Requested: Gel Manicure • Acrylic Nails
💰 Estimated Total: $70.00+
📋 Booking Reference: A1B2C3D4

[View in Admin Dashboard →]
```

---

## **🧪 Testing Step by Step**

### **Test 1: Verify Email Configuration**

**Go to:** http://localhost:3000/api/test-email

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "emailInfo": {
    "from": "abc@gmail.com",
    "to": "abc@gmail.com",
    "subject": "🧪 MK Nails Booking System - Email Test"
  }
}
```

**Check:** Your inbox or spam folder
- You should receive the test email within 2 minutes ✅

### **Test 2: Submit a Test Booking**

1. Go to: http://localhost:3000/booking
2. Click **Fill Dummy Data** button (auto-fills form)
3. Click **Submit Booking**
4. Wait 2-3 seconds for redirect

**Check Server Console:**
```
✅ Email sent successfully (attempt 1/3):
{
  to: 'abc@gmail.com'
  subject: '📞 New Booking – Test Customer'
  messageId: '<..@gmail.com>'
}
```

**Check Email Inbox:**
- Look for email with subject: "📞 New Booking – Test Customer"
- Verify all booking details are in the email ✅

### **Test 3: Verify Booking Was Saved**

**Check Admin Dashboard:** http://localhost:3000/admin
- You should see the booking in the real-time bookings list

**Check Database:**
- Go to https://app.supabase.com → Table Editor
- Click **bookings** table
- New booking should appear at top ✅

---

## **📊 How the Email Service Works**

### **lib/email-service.ts** - Email utilities library

```typescript
// Functions available:
sendEmail()                    // Generic email sender with retry logic
sendBookingNotification()      // Sends booking email to staff
sendCustomerConfirmation()     // Sends confirmation to customer (future)
emailTemplates.testEmail()     // Test email template
emailTemplates.bookingNotification() // Booking email template
```

### **Usage in Booking Flow:**

```typescript
// In app/booking/actions.ts
import { sendBookingNotification } from '@/lib/email-service'

// After booking is saved to database:
sendBookingNotification(
  customerName,
  phone,
  bookingTimeFormatted,
  serviceNames,
  estimatedTotal,
  booking.id
).catch(err => console.error('Email failed:', err))
```

**Key Features:**
- ✅ Automatic retry (3 attempts)
- ✅ Detailed logging
- ✅ Doesn't block booking creation
- ✅ Graceful error handling
- ✅ Professional templates

---

## **🔍 Monitoring & Debugging**

### **Check Email Logs in Dev Server**

Watch the `pnpm dev` terminal output:

**✅ SUCCESS:**
```
✅ Email sent successfully (attempt 1/3):
  to: 'abc@gmail.com',
  subject: '📞 New Booking – Test Customer',
  messageId: '<ABC123@gmail.com>',
  response: '250 2.0.0 OK'
```

**❌ FAILURE:**
```
❌ Email send failed (attempt 1/3):
  to: 'abc@gmail.com',
  subject: '📞 New Booking – Test Customer',
  error: 'Invalid login: invalid user or password'
```

### **Common Issues & Fixes**

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not arriving | Wrong Gmail credentials | Verify GMAIL_USER and GMAIL_APP_PASSWORD in .env.local |
| "Invalid login" error | Using regular password instead of app password | Generate App Password at https://myaccount.google.com/apppasswords |
| STAFF_EMAIL not configured | Missing in .env.local | Add: `STAFF_EMAIL=your-email@gmail.com` |
| Email arriving in spam | Gmail trust issue | Open email, mark as "Not Spam" |
| "Please log in with your app password" | 2FA issue | Enable 2-Step Verification in Gmail account |
| 5-second delays | Network/DNS issue | Check internet connection or Gmail API status |

---

## **📋 Configuration Reference**

### **.env.local - Email Settings**

```env
# Required for booking notification emails
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Where staff notifications are sent
STAFF_EMAIL=your-email@gmail.com

# Used in email links (for local testing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Getting Gmail App Password**

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Scroll to "2-Step Verification"
   - Click it and follow prompts

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Device type: Select your device type (Windows Computer, etc.)
   - App: Mail
   - Click **Generate**
   - Copy the 16-character password
   - Paste into .env.local

---

## **✅ Pre-Deployment Checklist**

Before deploying to production:

- [ ] Gmail App Password generated and stored securely
- [ ] .env.local updated with real credentials
- [ ] Test email endpoint returns success: POST /api/test-email
- [ ] Test booking flow works end-to-end
- [ ] Email arrives in inbox within 2 minutes
- [ ] Admin dashboard displays new booking
- [ ] No errors in console logs

### **Production Setup**

```env
# .env.production
GMAIL_USER=salon@yourdomain.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
STAFF_EMAIL=owner@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Then test: `POST https://yourdomain.com/api/test-email`

---

## **📞 Testing Commands**

### **Test Email System:**
```bash
# Via cURL
curl -X POST http://localhost:3000/api/test-email

# Via PowerShell
Invoke-RestMethod -Uri http://localhost:3000/api/test-email -Method POST
```

### **View Server Logs:**
```bash
pnpm dev
# Watch for ✅ Email sent or ❌ Email failed messages
```

### **Rebuild & Test:**
```bash
pnpm build      # Verify no errors
pnpm dev        # Start server
# Go to http://localhost:3000/booking
# Fill form and submit
```

---

## **Files Modified**

1. **[lib/email-service.ts](lib/email-service.ts)** - NEW
   - Email utilities with templates and retry logic
   - ~200 lines of tested email functionality

2. **[app/booking/actions.ts](app/booking/actions.ts)** - UPDATED
   - Now uses email service
   - Simplified email handling
   - Better error messages

3. **[app/api/test-email/route.ts](app/api/test-email/route.ts)** - UPDATED
   - Now tests Gmail SMTP connection
   - Better error messages and troubleshooting steps

4. **[EMAIL_TESTING_GUIDE.md](EMAIL_TESTING_GUIDE.md)** - NEW
   - Complete testing guide with examples
   - Production deployment checklist
   - Troubleshooting reference

---

## **🎯 Next Steps**

1. ✅ **Right now:** Get Gmail App Password and update .env.local
2. ✅ **Restart server:** `pnpm dev`
3. ✅ **Test email:** `POST /api/test-email` in browser
4. ✅ **Test booking:** Submit form at `/booking`
5. ✅ **Check email:** Should arrive in 1-2 minutes
6. ✅ **Done!** Email system is working

---

## **💡 Pro Tips**

- **Mark test emails as "Not Spam"** in Gmail - improves delivery
- **Check spam folder first** if you don't see email
- **Use same email for GMAIL_USER and STAFF_EMAIL** for testing
- **Logs show everything** - check `pnpm dev` output if issues occur
- **Test endpoint always shows error details** in JSON response

---

**Ready to test? Start with updating .env.local and running `pnpm dev`! 🚀**

For detailed step-by-step guide, see: [EMAIL_TESTING_GUIDE.md](EMAIL_TESTING_GUIDE.md)

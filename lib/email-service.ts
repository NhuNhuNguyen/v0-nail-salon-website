/**
 * Email Service Utility
 * Handles sending emails via Gmail SMTP
 * Configured via .env.local: GMAIL_USER, GMAIL_APP_PASSWORD
 */

import nodemailer from 'nodemailer'

// Email templates
export const emailTemplates = {
  bookingNotification: (customerName: string, phone: string, bookingTime: string, services: string[], estimatedTotal: number, bookingId: string) => ({
    subject: `📞 New Booking – ${customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b4789 0%, #a855a5 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
            .section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
            .section:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { color: #1f2937; font-size: 14px; }
            .value a { color: #8b4789; text-decoration: none; }
            .value a:hover { text-decoration: underline; }
            .button { display: inline-block; background-color: #8b4789; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
            .button:hover { background-color: #a855a5; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 20px; border-radius: 4px; }
            .alert-text { color: #92400e; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ New Booking Received</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">MK Fashion Nails & Spa</p>
            </div>
            <div class="content">
              <div class="alert">
                <div class="alert-text">⏰ ACTION REQUIRED: Please call the customer ASAP to confirm this booking.</div>
              </div>
              
              <div class="section">
                <div class="label">👤 Customer Name</div>
                <div class="value">${customerName}</div>
              </div>
              
              <div class="section">
                <div class="label">📱 Phone Number</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              
              <div class="section">
                <div class="label">📅 Requested Date & Time</div>
                <div class="value">${bookingTime}</div>
              </div>
              
              <div class="section">
                <div class="label">💅 Services Requested</div>
                <div class="value">${services.join(' • ')}</div>
              </div>
              
              <div class="section">
                <div class="label">💰 Estimated Total</div>
                <div class="value">$${(estimatedTotal / 100).toFixed(2)}+</div>
              </div>
              
              <div class="section">
                <div class="label">📋 Booking Reference</div>
                <div class="value" style="font-family: 'Courier New', monospace; font-weight: 600;">${bookingId}</div>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" class="button">View in Admin Dashboard →</a>
              
              <div class="footer">
                <p>📧 This is an automated message from the MK Fashion Nails booking system.</p>
                <p>Do not reply to this email. Use the Admin Dashboard for booking management.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  testEmail: () => ({
    subject: '🧪 MK Nails Booking System - Email Test',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b4789 0%, #a855a5 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Email System Working!</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p>Your email configuration is working correctly. This is a test message sent from the MK Fashion Nails booking system.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Configuration Details:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li><strong>From:</strong> ${process.env.GMAIL_USER}</li>
            <li><strong>To:</strong> ${process.env.STAFF_EMAIL}</li>
            <li><strong>App URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}</li>
            <li><strong>Sent at:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })}</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 13px; margin: 0;">
            Booking system emails are now configured and ready to send notifications to staff when customers submit bookings.
          </p>
        </div>
      </div>
    `,
  }),
}

/**
 * Initialize nodemailer transporter with Gmail SMTP
 */
function getTransporter() {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPass) {
    const missing = []
    if (!gmailUser) missing.push('GMAIL_USER')
    if (!gmailPass) missing.push('GMAIL_APP_PASSWORD')
    throw new Error(
      `Gmail credentials not configured: ${missing.join(', ')} required in .env.local or production environment`
    )
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  })
}

/**
 * Send email with retry logic and detailed error handling
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: { retries?: number; delayMs?: number }
) {
  const maxRetries = options?.retries ?? 3
  const delayMs = options?.delayMs ?? 1000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Email] Attempt ${attempt}/${maxRetries} - Sending to: ${to}`)
      const transporter = getTransporter()
      
      const info = await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        html,
      })

      console.log(`✅ Email sent successfully (attempt ${attempt}/${maxRetries}):`, {
        to,
        subject,
        messageId: info.messageId,
        response: info.response,
      })

      return { success: true, info }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorCode = (error as any)?.code
      
      console.error(`❌ Email send failed (attempt ${attempt}/${maxRetries}):`, {
        to,
        subject,
        error: errorMessage,
        code: errorCode,
        gmailConfigured: !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD,
      })

      if (attempt === maxRetries) {
        // Final attempt failed - throw error
        throw new Error(`Email delivery failed after ${maxRetries} attempts: ${errorMessage}`)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
    }
  }
}

/**
 * Send booking notification email to staff
 */
export async function sendBookingNotification(
  customerName: string,
  phone: string,
  bookingTime: string,
  services: string[],
  estimatedTotal: number,
  bookingId: string
) {
  // Validation
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    const missing = []
    if (!process.env.GMAIL_USER) missing.push('GMAIL_USER')
    if (!process.env.GMAIL_APP_PASSWORD) missing.push('GMAIL_APP_PASSWORD')
    console.error('❌ EMAIL CONFIG ERROR - Missing credentials:', missing.join(', '))
    return { success: false, error: `Missing email config: ${missing.join(', ')}` }
  }

  if (!process.env.STAFF_EMAIL) {
    console.error('❌ EMAIL CONFIG ERROR - STAFF_EMAIL not set')
    return { success: false, error: 'STAFF_EMAIL not configured' }
  }

  try {
    console.log(`📧 Attempting to send booking notification email to ${process.env.STAFF_EMAIL}`)
    const template = emailTemplates.bookingNotification(customerName, phone, bookingTime, services, estimatedTotal, bookingId)
    
    const result = await sendEmail(process.env.STAFF_EMAIL, template.subject, template.html)
    console.log('✅ Booking notification email sent successfully')
    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ Failed to send booking notification email:', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
      staffEmail: process.env.STAFF_EMAIL,
      gmailUser: process.env.GMAIL_USER,
    })
    return { success: false, error: errorMsg }
  }
}

/**
 * Send confirmation email to customer
 */
export async function sendCustomerConfirmation(
  customerEmail: string,
  customerName: string,
  confirmationToken: string
) {
  try {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/confirm/${confirmationToken}`
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b4789 0%, #a855a5 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✨ Booking Submitted!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">MK Fashion Nails & Spa</p>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p>Hi ${customerName},</p>
          <p>Thank you for submitting your booking request! We've received your booking and will call you shortly to confirm your appointment.</p>
          <p style="margin-top: 30px;">
            <a href="${confirmLink}" style="display: inline-block; background-color: #8b4789; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Booking Details →</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 13px;">If you need to reschedule or have any questions, please call us or reply to our confirmation call.</p>
        </div>
      </div>
    `
    
    await sendEmail(customerEmail, '✨ Your Booking Submitted - MK Fashion Nails', html)
    return { success: true }
  } catch (error) {
    console.error('Failed to send customer confirmation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

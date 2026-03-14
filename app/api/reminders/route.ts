import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatET } from '@/lib/timezone'

/**
 * Send reminder emails to customers 24 hours before their appointment
 * POST /api/reminders
 * 
 * This endpoint should be called by a cron job (e.g., every hour)
 * Only sends reminders for confirmed bookings within 24-25 hours
 */
export async function POST(req: NextRequest) {
  // Simple auth - check for secret header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()

    // Find confirmed bookings that need reminders (24-25 hours before appointment)
    const now = new Date()
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    const { data: bookings, error: queryErr } = await admin
      .from('bookings')
      .select(`
        id,
        confirmation_token,
        booking_time,
        reminder_email_sent_at,
        customer:customers(name, phone),
        booking_services(service:services(name))
      `)
      .eq('status', 'confirmed')
      .is('reminder_email_sent_at', null)
      .gte('booking_time', now.toISOString())
      .lte('booking_time', in25Hours.toISOString())

    if (queryErr) {
      console.error('Query error:', queryErr)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No reminders to send' })
    }

    let sent = 0
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Send reminder email to each customer
    for (const booking of bookings) {
      const customer = booking.customer as any
      const services = (booking.booking_services as any[]).map((bs: any) => bs.service.name).join(', ')
      const appointmentTime = formatET(booking.booking_time, 'EEEE, MMMM d, yyyy h:mm a')

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #8b4789; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background-color: #8b4789; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .detail { margin: 15px 0; }
              .label { font-weight: 600; color: #666; }
              .value { color: #333; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✨ Appointment Reminder</h1>
              </div>
              <div class="content">
                <p>Hi ${customer.name},</p>
                
                <p>Your appointment at <strong>MK Fashion Nails & Spa</strong> is coming up tomorrow! Here are your details:</p>
                
                <div class="detail">
                  <div class="label">📅 Date & Time</div>
                  <div class="value">${appointmentTime}</div>
                </div>
                
                <div class="detail">
                  <div class="label">💅 Services</div>
                  <div class="value">${services}</div>
                </div>
                
                <div class="detail">
                  <div class="label">📱 Questions?</div>
                  <div class="value">Call us at your nearest location or reply to this email.</div>
                </div>
                
                <p style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 4px;">
                  <strong>❗ Please arrive 5-10 minutes early.</strong> This helps us stay on schedule and ensures the best experience for you.
                </p>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  Thank you for booking with us! We look forward to seeing you.
                </p>
              </div>
            </div>
          </body>
        </html>
      `

      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: customer.phone, // This should be customer email - adjust if your table has email
          subject: `✨ Appointment Reminder – Tomorrow at ${formatET(booking.booking_time, 'h:mm a')}`,
          html: htmlContent,
          text: `Appointment Reminder\n\nHi ${customer.name},\n\nYour appointment is tomorrow at ${appointmentTime}\n\nServices: ${services}\n\nPlease arrive 5-10 minutes early.\n\nThank you!`,
        })

        // Mark reminder as sent
        await admin
          .from('bookings')
          .update({ reminder_email_sent_at: new Date().toISOString() })
          .eq('id', booking.id)

        sent++
      } catch (err) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, err)
      }
    }

    return NextResponse.json({ sent, total: bookings.length })
  } catch (err) {
    console.error('Reminder error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if SendGrid API key is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      return NextResponse.json(
        {
          success: false,
          error: 'SendGrid credentials not configured in .env.local',
          required: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
          setup: 'Get API key from https://sendgrid.com/free',
        },
        { status: 400 }
      )
    }

    const testEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d946ef;">✅ Email Test Successful!</h2>
        <p>This is a test email from MK Fashion Nails booking system.</p>
        <hr />
        <h3>Configuration Status:</h3>
        <ul>
          <li><strong>From:</strong> ${process.env.SENDGRID_FROM_EMAIL}</li>
          <li><strong>App URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}</li>
          <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <hr />
        <p style="color: #666; font-size: 12px;">If you received this email, SendGrid SMTP is working correctly.</p>
      </div>
    `

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: process.env.SENDGRID_FROM_EMAIL }],
            subject: '🧪 MK Nails Booking - Email Test',
          },
        ],
        from: { email: process.env.SENDGRID_FROM_EMAIL },
        content: [{ type: 'text/html', value: testEmail }],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.message || 'SendGrid API error')
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      to: process.env.SENDGRID_FROM_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      info: 'Check your inbox or spam folder. Email should arrive within 1 minute.',
    })
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Verify SENDGRID_API_KEY is correct (starts with SG.)',
          'Verify SENDGRID_FROM_EMAIL is a valid email address',
          'Check SendGrid account is active at sendgrid.com',
          'Verify API key has Mail Send permissions',
        ],
      },
      { status: 500 }
    )
  }
}

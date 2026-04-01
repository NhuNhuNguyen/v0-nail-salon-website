/**
 * Direct Gmail SMTP Test
 * Bypasses all other logic to directly test Gmail connection
 * 
 * Usage: POST /api/debug/gmail-test?token=YOUR_CRON_SECRET
 */

import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    
    // Verify token
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('[Gmail Test] Starting direct Gmail SMTP test...')
    console.log('[Gmail Test] Gmail User:', process.env.GMAIL_USER)
    console.log('[Gmail Test] Gmail Pass Length:', process.env.GMAIL_APP_PASSWORD?.length)
    console.log('[Gmail Test] Staff Email:', process.env.STAFF_EMAIL)

    // Step 1: Validate credentials
    if (!process.env.GMAIL_USER) {
      return NextResponse.json({
        success: false,
        error: 'GMAIL_USER not configured',
        step: 'validation',
      })
    }
    if (!process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'GMAIL_APP_PASSWORD not configured',
        step: 'validation',
      })
    }
    if (!process.env.STAFF_EMAIL) {
      return NextResponse.json({
        success: false,
        error: 'STAFF_EMAIL not configured',
        step: 'validation',
      })
    }

    // Step 2: Create transporter
    console.log('[Gmail Test] Creating nodemailer transporter...')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Step 3: Verify connection
    console.log('[Gmail Test] Verifying SMTP connection...')
    await transporter.verify()
    console.log('[Gmail Test] SMTP connection verified ✅')

    // Step 4: Send test email
    console.log('[Gmail Test] Sending test email...')
    const testEmail = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial; color: #333;">
          <h1>🧪 Gmail SMTP Test</h1>
          <p>If you received this email, Gmail is working correctly!</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p><strong>From:</strong> ${process.env.GMAIL_USER}</p>
          <hr />
          <p style="color: #666; font-size: 12px;">This is an automated test.</p>
        </body>
      </html>
    `

    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.STAFF_EMAIL,
      subject: '🧪 MK Nails Gmail SMTP Test',
      html: testEmail,
    })

    console.log('[Gmail Test] Email sent successfully! ✅')
    console.log('[Gmail Test] Message ID:', info.messageId)

    return NextResponse.json({
      success: true,
      message: '✅ Email sent successfully!',
      details: {
        from: process.env.GMAIL_USER,
        to: process.env.STAFF_EMAIL,
        messageId: info.messageId,
        response: info.response,
        timestamp: new Date().toISOString(),
      },
      instructions: [
        'Check your Gmail inbox at: ' + process.env.STAFF_EMAIL,
        'Check spam/promotions folder if not found',
        'Email should arrive within 1-2 minutes',
        'If still not received, check Gmail security settings',
      ],
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorCode = (error as any)?.code
    const errorCommand = (error as any)?.command

    console.error('[Gmail Test] Error:', {
      message: errorMsg,
      code: errorCode,
      command: errorCommand,
    })

    // Analyze common errors
    let diagnosis = ''
    if (errorMsg.includes('Invalid login')) {
      diagnosis = 'Gmail credentials are WRONG. Check GMAIL_USER and GMAIL_APP_PASSWORD.'
    } else if (errorMsg.includes('authentication failed')) {
      diagnosis = 'GMAIL_APP_PASSWORD appears to be a regular password, not an App Password. Generate one at: https://myaccount.google.com/apppasswords'
    } else if (errorMsg.includes('connect')) {
      diagnosis = 'Network error connecting to Gmail. Check internet connection and firewall.'
    } else if (errorMsg.includes('timeout')) {
      diagnosis = 'Connection timeout. Gmail servers might be slow or blocked.'
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        code: errorCode,
        command: errorCommand,
        diagnosis,
        troubleshooting: {
          step1: 'Get GMAIL_APP_PASSWORD from: https://myaccount.google.com/apppasswords',
          step2: 'Use a 16-CHARACTER APP PASSWORD (not your regular Gmail password)',
          step3: 'Update Environment Variables in Netlify',
          step4: 'Trigger a new deploy',
        },
        environment: process.env.NODE_ENV,
        gmailConfigured: !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD,
      },
      { status: 500 }
    )
  }
}

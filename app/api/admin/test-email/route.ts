/**
 * Admin Email Test Endpoint
 * Used to diagnose email configuration issues
 * 
 * Usage: POST /api/admin/test-email?token=YOUR_ADMIN_TOKEN
 */

import { NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    // Get admin token from query param
    const url = new URL(request.url)
    const adminToken = url.searchParams.get('token')
    
    // Verify admin access (use CRON_SECRET as proxy for admin authentication)
    if (adminToken !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if Gmail is configured
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    const staffEmail = process.env.STAFF_EMAIL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!gmailUser || !gmailPass || !staffEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email configuration incomplete',
          missing: {
            GMAIL_USER: !gmailUser,
            GMAIL_APP_PASSWORD: !gmailPass,
            STAFF_EMAIL: !staffEmail,
          },
          configured: {
            GMAIL_USER: gmailUser ? '✅ Set' : '❌ Missing',
            GMAIL_APP_PASSWORD: gmailPass ? '✅ Set (hidden)' : '❌ Missing',
            STAFF_EMAIL: staffEmail || '❌ Missing',
            NEXT_PUBLIC_APP_URL: appUrl || 'http://localhost:3000',
          },
          instructions: {
            step1: 'Go to https://app.supabase.com → Project Settings → Integrations',
            step2: 'Add environment variables to your production platform',
            step3: 'For Gmail App Password: https://myaccount.google.com/apppasswords',
            step4: 'Use a 16-character App Password (NOT your regular password)',
          },
          environment: process.env.NODE_ENV,
        },
        { status: 400 }
      )
    }

    // Try to send a test email
    console.log('[Admin Email Test] Attempting to send test email...')
    console.log('[Admin Email Test] From:', gmailUser)
    console.log('[Admin Email Test] To:', staffEmail)

    const template = emailTemplates.testEmail()
    const result = await sendEmail(staffEmail, template.subject, template.html)

    return NextResponse.json({
      success: true,
      message: '✅ Test email sent successfully',
      details: {
        from: gmailUser,
        to: staffEmail,
        subject: template.subject,
        timestamp: new Date().toISOString(),
        messageId: result.info?.messageId,
        info: result.info?.response,
      },
      nextSteps: [
        'Check your inbox at: ' + staffEmail,
        'Check spam folder if not found',
        'Email should arrive within 1-2 minutes',
        'If still not received, verify Gmail App Password is correct',
      ],
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorCode = (error as any)?.code

    console.error('[Admin Email Test] Error:', errorMsg)

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        type: error instanceof Error ? error.constructor.name : typeof error,
        code: errorCode,
        troubleshooting: {
          checkCredentials: 'Verify GMAIL_USER and GMAIL_APP_PASSWORD in production environment',
          appPassword: 'Use Gmail App Password, NOT your regular password: https://myaccount.google.com/apppasswords',
          staffEmail: 'Verify STAFF_EMAIL is configured and is a valid email address',
          gmail2FA: 'If Gmail 2FA enabled, an App Password is required (regular password won\'t work)',
          gmailAccess: 'Less secure app access may be blocked - check Google Account Security Settings',
        },
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}

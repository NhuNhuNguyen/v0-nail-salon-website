import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if Twilio credentials are configured
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Twilio credentials not configured in .env.local',
          required: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
          info: 'SMS is optional. Sign up at twilio.com/try-twilio to enable SMS notifications.',
        },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    // For testing, send to a test number (you should verify your own number in Twilio first)
    // In production, this would be the customer's phone
    const testMessage = `Hi! This is a test SMS from MK Fashion Nails booking system. If you received this, SMS is working correctly. 💅`

    const formData = new URLSearchParams()
    formData.append('From', fromNumber)
    formData.append('To', fromNumber) // Send to self for testing
    formData.append('Body', testMessage)

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || 'Twilio API error',
          code: data.code,
          troubleshooting:
            data.code === 21211
              ? 'Phone number not verified in Twilio. Add it at twilio.com/console'
              : 'Check Account SID and Auth Token are correct',
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      sid: data.sid,
      from: data.from,
      to: data.to,
      status: data.status,
      info: 'Check your phone for SMS. If trial account, verify number is registered in Twilio console.',
    })
  } catch (error) {
    console.error('SMS test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Verify Twilio Account SID and Auth Token are correct',
          'Verify phone number is added to Twilio account',
          'For trial: verify customer phone number at twilio.com/console',
          'Check internet connection',
        ],
      },
      { status: 500 }
    )
  }
}

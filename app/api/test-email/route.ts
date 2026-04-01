import { NextResponse } from 'next/server'

export async function POST() {
  // Test endpoints are disabled in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        success: false,
        error: 'Test endpoints are disabled in production',
      },
      { status: 403 }
    )
  }

  // Development only
  return NextResponse.json(
    {
      success: false,
      error: 'Email testing should be done through the integration test page',
    },
    { status: 404 }
  )
}


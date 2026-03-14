'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatET } from '@/lib/timezone'

// Twilio SMS helper
async function sendSMS(toPhone: string, message: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio not configured, skipping SMS')
    return
  }

  try {
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + process.env.TWILIO_ACCOUNT_SID + '/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_PHONE_NUMBER,
        To: toPhone,
        Body: message,
      }).toString(),
    })

    if (!response.ok) {
      console.error('Twilio SMS error:', await response.text())
    }
  } catch (err) {
    console.error('SMS send failed:', err)
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'completed' | 'cancelled',
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Fetch booking details before updating
  const { data: booking } = await supabase
    .from('bookings')
    .select('*,customer:customers(name,phone),booking_time')
    .eq('id', bookingId)
    .single()

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)

  if (error) return { error: error.message }

  // Send SMS to customer when confirmed
  if (status === 'confirmed' && booking) {
    const customer = booking.customer as any
    const appointmentTime = formatET(booking.booking_time, 'h:mm a MMM d')
    const message = `Hi ${customer.name}, your appointment at MK Fashion Nails is confirmed for ${appointmentTime}. See you soon! 💅`
    
    await sendSMS(customer.phone, message)

    // Log the call
    await supabase
      .from('call_logs')
      .insert({
        booking_id: bookingId,
        admin_notes: 'Booking confirmed via admin dashboard',
      })
  }

  // Send cancellation SMS
  if (status === 'cancelled' && booking) {
    const customer = booking.customer as any
    const message = `Hi ${customer.name}, your appointment at MK Fashion Nails & Spa has been cancelled. Please contact us if you have questions.`
    
    await sendSMS(customer.phone, message)
  }

  return {}
}

export async function updateBooking(
  bookingId: string,
  updates: { booking_time?: string; staff_id?: string | null },
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)

  if (error) return { error: error.message }

  return {}
}

export async function getBookingImageUrls(
  paths: string[],
): Promise<{ urls: string[]; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { urls: [], error: 'Unauthorized' }

  const admin = createAdminClient()
  const urls: string[] = []
  for (const path of paths) {
    const { data } = await admin.storage
      .from('booking-images')
      .createSignedUrl(path, 60 * 60) // 1-hour expiry
    if (data?.signedUrl) urls.push(data.signedUrl)
  }

  return { urls }
}

export async function fetchBookingsByRange(
  startDate: string,
  endDate: string,
): Promise<{ data: any[]; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_bookings_by_range', {
    start_date: startDate,
    end_date: endDate,
  })

  if (error) return { data: [], error: error.message }

  return { data: (data as any[]) ?? [] }
}

export async function fetchStaff(): Promise<{ data: any[]; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) return { data: [], error: error.message }
  return { data: data ?? [] }
}

export async function getCallLogs(bookingId: string): Promise<{ data: any[]; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .eq('booking_id', bookingId)
    .order('called_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [] }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'completed' | 'cancelled',
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)

  if (error) return { error: error.message }

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

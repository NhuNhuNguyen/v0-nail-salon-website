'use server'

import { createClient } from '@/lib/supabase/server'
import type { BookingWithDetails } from '@/lib/types'

function parseBookings(raw: any[]): BookingWithDetails[] {
  return raw.map((b: any) => ({
    id: b.id,
    customer_id: b.customer_id,
    staff_id: b.staff_id ?? null,
    confirmation_token: b.confirmation_token,
    status: b.status,
    estimated_total: b.estimated_total,
    deposit_amount: b.deposit_amount,
    deposit_image_path: b.deposit_image_path ?? null,
    deposit_uploaded_at: b.deposit_uploaded_at ?? null,
    notes: b.notes,
    sample_image_paths: b.sample_image_paths ?? [],
    booking_time: b.booking_time,
    created_at: b.created_at,
    customer: b.customer,
    staff: b.staff ?? null,
    booking_services: (b.booking_services ?? []).map((bs: any) => ({
      id: bs.id,
      booking_id: bs.booking_id,
      service_id: bs.service_id,
      price_at_booking: bs.price_at_booking,
      service: bs.service,
    })),
  }))
}

export interface HistoryFilters {
  from?: string
  to?: string
  customer?: string
  category?: string
  staff?: string
  status?: string
  page?: number
}

export async function fetchBookingsPaginated(
  filters: HistoryFilters,
): Promise<{ data: BookingWithDetails[]; totalCount: number; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], totalCount: 0, error: 'Unauthorized' }

  const { data, error } = await supabase.rpc('get_bookings_paginated', {
    p_start_date: filters.from || null,
    p_end_date: filters.to || null,
    p_customer_search: filters.customer || null,
    p_category: filters.category || null,
    p_staff_id: filters.staff || null,
    p_status: filters.status || null,
    p_page: filters.page || 1,
    p_page_size: 20,
  })

  if (error) return { data: [], totalCount: 0, error: error.message }

  const result = data as any
  return {
    data: parseBookings(result?.data ?? []),
    totalCount: result?.total_count ?? 0,
  }
}

export async function fetchAllBookingsForExport(
  filters: HistoryFilters,
): Promise<{ data: BookingWithDetails[]; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Unauthorized' }

  // Use a large page size to get all matching records
  const { data, error } = await supabase.rpc('get_bookings_paginated', {
    p_start_date: filters.from || null,
    p_end_date: filters.to || null,
    p_customer_search: filters.customer || null,
    p_category: filters.category || null,
    p_staff_id: filters.staff || null,
    p_status: filters.status || null,
    p_page: 1,
    p_page_size: 10000,
  })

  if (error) return { data: [], error: error.message }

  const result = data as any
  return { data: parseBookings(result?.data ?? []) }
}

export async function fetchServiceCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('services')
    .select('category')
    .eq('active', true)
    .order('sort_order')

  if (!data) return []

  // Deduplicate while preserving order
  const seen = new Set<string>()
  const categories: string[] = []
  for (const row of data) {
    if (!seen.has(row.category)) {
      seen.add(row.category)
      categories.push(row.category)
    }
  }
  return categories
}

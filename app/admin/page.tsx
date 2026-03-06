import type { Metadata } from 'next'
import { endOfWeek, format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { RealtimeBookings } from '@/components/admin/realtime-bookings'
import type { BookingWithDetails, Staff } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Bookings | MK Admin',
}

export default async function AdminPage() {
  const supabase = await createClient()

  const today = new Date()
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
  const fromStr = format(today, 'yyyy-MM-dd')
  const toStr = format(weekEnd, 'yyyy-MM-dd')

  const [{ data: rawBookings }, { data: rawStaff }] = await Promise.all([
    supabase.rpc('get_bookings_by_range', {
      start_date: fromStr,
      end_date: toStr,
    }),
    supabase.from('staff').select('*').eq('active', true).order('name'),
  ])

  const staffList: Staff[] = (rawStaff as Staff[]) ?? []

  const bookings: BookingWithDetails[] = ((rawBookings as any[]) ?? []).map(
    (b: any) => ({
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
    }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Bookings</h1>
        <p className="text-muted-foreground">
          Manage bookings &mdash; switch between list and calendar views.
        </p>
      </div>
      <RealtimeBookings initialBookings={bookings} initialFrom={fromStr} initialTo={toStr} staff={staffList} />
    </div>
  )
}

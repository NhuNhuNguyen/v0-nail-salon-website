import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBookingsPaginated, fetchServiceCategories } from './actions'
import { fetchStaff } from '@/app/admin/actions'
import { BookingHistory } from '@/components/admin/booking-history'

export const metadata: Metadata = {
  title: 'Booking History | MK Admin',
}

interface HistoryPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    customer?: string
    category?: string
    staff?: string
    status?: string
    page?: string
  }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)

  const [bookingsResult, staffResult, categories] = await Promise.all([
    fetchBookingsPaginated({
      from: params.from,
      to: params.to,
      customer: params.customer,
      category: params.category,
      staff: params.staff,
      status: params.status,
      page,
    }),
    fetchStaff(),
    fetchServiceCategories(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Booking History</h1>
        <p className="text-sm text-muted-foreground">
          View and export all booking records with filters.
        </p>
      </div>
      <BookingHistory
        initialBookings={bookingsResult.data}
        initialTotalCount={bookingsResult.totalCount}
        staff={staffResult.data ?? []}
        categories={categories}
        initialFilters={{
          from: params.from || '',
          to: params.to || '',
          customer: params.customer || '',
          category: params.category || '',
          staff: params.staff || '',
          status: params.status || '',
          page,
        }}
      />
    </div>
  )
}

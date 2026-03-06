'use client'

import { useMemo } from 'react'
import { BookingsTable } from '@/components/admin/bookings-table'
import type { BookingWithDetails, Staff } from '@/lib/types'

interface GroupedBookingsProps {
  bookings: BookingWithDetails[]
  onStatusChange?: () => void
  staff: Staff[]
}

export function GroupedBookings({ bookings, onStatusChange, staff }: GroupedBookingsProps) {
  const sorted = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [bookings],
  )

  if (bookings.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No pending bookings in this date range.
      </p>
    )
  }

  return <BookingsTable bookings={sorted} onStatusChange={onStatusChange} staff={staff} />
}

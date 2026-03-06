'use client'

import { useMemo } from 'react'
import { BookingsTable } from '@/components/admin/bookings-table'
import type { BookingWithDetails, Staff } from '@/lib/types'
import { formatET } from '@/lib/timezone'

interface GroupedBookingsProps {
  bookings: BookingWithDetails[]
  onStatusChange?: () => void
  staff: Staff[]
}

export function GroupedBookings({ bookings, onStatusChange, staff }: GroupedBookingsProps) {
  const groups = useMemo(() => {
    const map = new Map<string, BookingWithDetails[]>()
    for (const b of bookings) {
      const key = formatET(b.booking_time, 'yyyy-MM-dd')
      const arr = map.get(key) ?? []
      arr.push(b)
      map.set(key, arr)
    }
    // Sort bookings within each group by time ascending
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(a.booking_time).getTime() - new Date(b.booking_time).getTime())
    }
    // Sort groups by date ascending
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [bookings])

  if (bookings.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No pending bookings in this date range.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(([dateKey, group]) => (
        <div key={dateKey}>
          <h3 className="mb-2 font-serif text-lg text-foreground">
            {formatET(group[0].booking_time, 'EEEE, MMMM d, yyyy')}
          </h3>
          <BookingsTable bookings={group} onStatusChange={onStatusChange} staff={staff} />
        </div>
      ))}
    </div>
  )
}

'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { BookingsTable } from '@/components/admin/bookings-table'
import type { BookingWithDetails, Staff } from '@/lib/types'

interface GroupedBookingsProps {
  bookings: BookingWithDetails[]
  onStatusChange?: () => void
  staff: Staff[]
}

export function GroupedBookings({ bookings, onStatusChange, staff }: GroupedBookingsProps) {
  const groups = useMemo(() => {
    const map = new Map<string, BookingWithDetails[]>()
    for (const b of bookings) {
      const dateKey = format(parseISO(b.booking_time), 'yyyy-MM-dd')
      const arr = map.get(dateKey) ?? []
      arr.push(b)
      map.set(dateKey, arr)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({
        dateKey,
        label: format(parseISO(dateKey), 'EEEE, MMMM d, yyyy'),
        bookings: items,
      }))
  }, [bookings])

  if (bookings.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No bookings in this date range.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.dateKey} className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-lg text-foreground">{group.label}</h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {group.bookings.length} booking{group.bookings.length !== 1 ? 's' : ''}
            </span>
          </div>
          <BookingsTable bookings={group.bookings} onStatusChange={onStatusChange} staff={staff} />
        </div>
      ))}
    </div>
  )
}

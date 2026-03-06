'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
} from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { fetchBookingsByRange } from '@/app/admin/actions'
import { GroupedBookings } from '@/components/admin/grouped-bookings'
import { BookingCalendar } from '@/components/admin/booking-calendar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { BookingWithDetails, Staff } from '@/lib/types'
import { List, CalendarDays, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

type CalendarMode = 'month' | 'week' | 'day'

interface RealtimeBookingsProps {
  initialBookings: BookingWithDetails[]
  initialFrom: string
  initialTo: string
  staff: Staff[]
}

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

function getCalendarDateRange(date: Date, calendarMode: CalendarMode) {
  if (calendarMode === 'month') {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    return {
      start: format(startOfWeek(monthStart, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      end: format(endOfWeek(monthEnd, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    }
  }
  if (calendarMode === 'week') {
    return {
      start: format(startOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      end: format(endOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    }
  }
  const dayStr = format(date, 'yyyy-MM-dd')
  return { start: dayStr, end: dayStr }
}

export function RealtimeBookings({ initialBookings, initialFrom, initialTo, staff }: RealtimeBookingsProps) {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState(initialBookings)
  const [calendarBookings, setCalendarBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(false)

  // List date range filter
  const [listFrom, setListFrom] = useState<Date>(new Date(initialFrom + 'T00:00:00'))
  const [listTo, setListTo] = useState<Date>(new Date(initialTo + 'T00:00:00'))
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)

  // Fetch bookings for the list view using date range
  const fetchListBookings = useCallback(async () => {
    const from = format(listFrom, 'yyyy-MM-dd')
    const to = format(listTo, 'yyyy-MM-dd')
    const result = await fetchBookingsByRange(from, to)
    if (!result.error) {
      setBookings(parseBookings(result.data))
    }
  }, [listFrom, listTo])

  // Re-fetch list data when filter changes
  useEffect(() => {
    fetchListBookings()
  }, [fetchListBookings])

  // Fetch bookings for calendar view date range
  const fetchCalendarBookings = useCallback(async () => {
    setLoading(true)
    const range = getCalendarDateRange(currentDate, calendarMode)
    const result = await fetchBookingsByRange(range.start, range.end)
    if (!result.error) {
      setCalendarBookings(parseBookings(result.data))
    }
    setLoading(false)
  }, [currentDate, calendarMode])

  // Re-fetch calendar data when date or mode changes
  useEffect(() => {
    if (view === 'calendar') {
      fetchCalendarBookings()
    }
  }, [view, fetchCalendarBookings])

  // Real-time updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-bookings')
      .on('broadcast', { event: 'new-booking' }, () => {
        fetchListBookings()
        if (view === 'calendar') fetchCalendarBookings()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchListBookings, fetchCalendarBookings, view])

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <Tabs id="admin-bookings-view" value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list" className="gap-1.5">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* Date range filter */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">From</span>
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('min-w-[140px] justify-start text-left font-normal')}
                >
                  {format(listFrom, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={listFrom}
                  onSelect={(d) => {
                    if (d) {
                      setListFrom(d)
                      if (d > listTo) setListTo(d)
                    }
                    setFromOpen(false)
                  }}
                  defaultMonth={listFrom}
                />
              </PopoverContent>
            </Popover>
            <span className="text-sm text-muted-foreground">to</span>
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('min-w-[140px] justify-start text-left font-normal')}
                >
                  {format(listTo, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={listTo}
                  onSelect={(d) => {
                    if (d) {
                      setListTo(d)
                      if (d < listFrom) setListFrom(d)
                    }
                    setToOpen(false)
                  }}
                  disabled={(d) => d < listFrom}
                  defaultMonth={listTo}
                />
              </PopoverContent>
            </Popover>
          </div>
          <GroupedBookings bookings={bookings.filter((b) => b.status === 'pending')} onStatusChange={fetchListBookings} staff={staff} />
        </TabsContent>

        <TabsContent value="calendar">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading bookings…</div>
          ) : (
            <BookingCalendar
              bookings={calendarBookings.filter((b) => b.status === 'pending')}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              mode={calendarMode}
              onModeChange={setCalendarMode}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

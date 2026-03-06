'use client'

import { useMemo, useState } from 'react'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BookingWithDetails } from '@/lib/types'
import { cn } from '@/lib/utils'

type CalendarMode = 'month' | 'week' | 'day'

interface BookingCalendarProps {
  bookings: BookingWithDetails[]
  currentDate: Date
  onDateChange: (date: Date) => void
  mode: CalendarMode
  onModeChange: (mode: CalendarMode) => void
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-400',
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

export function BookingCalendar({
  bookings,
  currentDate,
  onDateChange,
  mode,
  onModeChange,
}: BookingCalendarProps) {
  // Group bookings by date string
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, BookingWithDetails[]>()
    for (const b of bookings) {
      const key = format(parseISO(b.booking_time), 'yyyy-MM-dd')
      const arr = map.get(key) ?? []
      arr.push(b)
      map.set(key, arr)
    }
    return map
  }, [bookings])

  function navigate(direction: 'prev' | 'next') {
    if (mode === 'month') {
      onDateChange(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    } else if (mode === 'week') {
      onDateChange(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
    } else {
      onDateChange(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1))
    }
  }

  function getTitle() {
    if (mode === 'month') return format(currentDate, 'MMMM yyyy')
    if (mode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
      return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
    }
    return format(currentDate, 'EEEE, MMMM d, yyyy')
  }

  return (
    <div className="space-y-4">
      {/* Header: Navigation + Mode toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="min-w-[200px] text-center font-serif text-lg text-foreground">
            {getTitle()}
          </h3>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs"
            onClick={() => onDateChange(new Date())}
          >
            Today
          </Button>
        </div>
        <Tabs value={mode} onValueChange={(v) => onModeChange(v as CalendarMode)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar body */}
      {mode === 'month' && (
        <MonthView
          currentDate={currentDate}
          bookingsByDate={bookingsByDate}
          onDateClick={(d) => {
            onDateChange(d)
            onModeChange('day')
          }}
        />
      )}
      {mode === 'week' && (
        <WeekView
          currentDate={currentDate}
          bookingsByDate={bookingsByDate}
          onDateClick={(d) => {
            onDateChange(d)
            onModeChange('day')
          }}
        />
      )}
      {mode === 'day' && (
        <DayView currentDate={currentDate} bookings={bookingsByDate.get(format(currentDate, 'yyyy-MM-dd')) ?? []} />
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        {Object.entries(statusColor).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', color)} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Month View ───

function MonthView({
  currentDate,
  bookingsByDate,
  onDateClick,
}: {
  currentDate: Date
  bookingsByDate: Map<string, BookingWithDetails[]>
  onDateClick: (date: Date) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted">
        {weekdays.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayBookings = bookingsByDate.get(key) ?? []
          const inMonth = isSameMonth(day, currentDate)
          const today = isToday(day)

          // Count by status
          const statusCounts = dayBookings.reduce(
            (acc, b) => {
              acc[b.status] = (acc[b.status] ?? 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

          return (
            <button
              key={key}
              onClick={() => onDateClick(day)}
              className={cn(
                'relative flex min-h-[80px] flex-col border-b border-r border-border p-1.5 text-left transition-colors hover:bg-muted/50',
                !inMonth && 'bg-muted/20 text-muted-foreground/50',
                i % 7 === 0 && 'border-l-0',
              )}
            >
              <span
                className={cn(
                  'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  today && 'bg-primary text-primary-foreground',
                )}
              >
                {format(day, 'd')}
              </span>
              {dayBookings.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <span
                      key={status}
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-white',
                        statusColor[status] ?? 'bg-muted',
                      )}
                    >
                      {count}
                    </span>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Week View ───

function WeekView({
  currentDate,
  bookingsByDate,
  onDateClick,
}: {
  currentDate: Date
  bookingsByDate: Map<string, BookingWithDetails[]>
  onDateClick: (date: Date) => void
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Day header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'px-2 py-2 text-center text-xs font-medium',
              isToday(day) ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <div>{format(day, 'EEE')}</div>
            <div
              className={cn(
                'mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm',
                isToday(day) && 'bg-primary text-primary-foreground',
              )}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayBookings = (bookingsByDate.get(key) ?? []).sort(
            (a, b) => new Date(a.booking_time).getTime() - new Date(b.booking_time).getTime(),
          )

          return (
            <button
              key={key}
              onClick={() => onDateClick(day)}
              className="flex min-h-[200px] flex-col gap-1 border-r border-border p-1.5 text-left transition-colors hover:bg-muted/50 last:border-r-0"
            >
              {dayBookings.length === 0 && (
                <span className="mt-4 text-center text-xs text-muted-foreground/50">—</span>
              )}
              {dayBookings.map((b) => (
                <div
                  key={b.id}
                  className={cn(
                    'rounded px-1.5 py-1 text-[11px] text-white',
                    statusColor[b.status] ?? 'bg-muted',
                  )}
                >
                  <div className="font-medium">
                    {format(parseISO(b.booking_time), 'h:mm a')}
                  </div>
                  <div className="truncate opacity-90">{b.customer.name}</div>
                  {b.staff && (
                    <div className="truncate opacity-75">{b.staff.name}</div>
                  )}
                </div>
              ))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Day View ───

function DayView({
  currentDate,
  bookings,
}: {
  currentDate: Date
  bookings: BookingWithDetails[]
}) {
  const sortedBookings = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(a.booking_time).getTime() - new Date(b.booking_time).getTime(),
      ),
    [bookings],
  )

  // Place bookings on the hour grid
  const bookingsByHour = useMemo(() => {
    const map = new Map<number, BookingWithDetails[]>()
    for (const b of sortedBookings) {
      const hour = parseISO(b.booking_time).getHours()
      const arr = map.get(hour) ?? []
      arr.push(b)
      map.set(hour, arr)
    }
    return map
  }, [sortedBookings])

  const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    confirmed: 'default',
    completed: 'secondary',
    cancelled: 'destructive',
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {HOURS.map((hour) => {
        const hourBookings = bookingsByHour.get(hour) ?? []
        const timeLabel = format(new Date(2000, 0, 1, hour), 'h a')

        return (
          <div
            key={hour}
            className={cn(
              'flex min-h-[60px] border-b border-border last:border-b-0',
              hourBookings.length > 0 && 'bg-muted/20',
            )}
          >
            <div className="flex w-16 shrink-0 items-start justify-end border-r border-border pr-2 pt-2 text-xs font-medium text-muted-foreground">
              {timeLabel}
            </div>
            <div className="flex-1 space-y-1 p-2">
              {hourBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-card p-2 text-sm shadow-sm"
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      statusColor[b.status],
                    )}
                  />
                  <span className="font-medium text-foreground">
                    {format(parseISO(b.booking_time), 'h:mm a')}
                  </span>
                  <span className="text-foreground">{b.customer.name}</span>
                  <span className="text-muted-foreground">{b.customer.phone}</span>
                  {b.staff && (
                    <span className="text-xs text-muted-foreground">· {b.staff.name}</span>
                  )}
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {b.booking_services.map((bs) => bs.service.name).join(', ')}
                  </span>
                  <Badge variant={statusBadgeVariant[b.status] ?? 'outline'} className="shrink-0">
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {sortedBookings.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No bookings for {format(currentDate, 'MMMM d, yyyy')}.
        </div>
      )}
    </div>
  )
}

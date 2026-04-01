'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { BookingWithDetails } from '@/lib/types'
import { Phone, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'

interface AdminStatsProps {
  initialBookings: BookingWithDetails[]
}

export function AdminStats({ initialBookings }: AdminStatsProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [mounted, setMounted] = useState(false)

  // Calculate stats
  const pendingCalls = bookings.filter((b) => b.status === 'pending').length
  const confirmedToday = bookings.filter((b) => {
    const today = new Date().toDateString()
    const bookingDate = new Date(b.booking_time).toDateString()
    return b.status === 'confirmed' && bookingDate === today
  }).length
  const totalRevenue = bookings.reduce((sum, b) => sum + b.estimated_total, 0)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    const channel = supabase
      .channel('admin-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          // Refresh stats when bookings change
          // In real app, would refetch bookings here
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Pending Calls */}
      <Card className={pendingCalls > 0 ? 'border-blue-200 dark:border-blue-900/30' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Calls</CardTitle>
          <Phone className={`h-4 w-4 ${pendingCalls > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCalls}</div>
          <p className="text-xs text-muted-foreground">
            {pendingCalls === 0 ? 'All caught up!' : `Need to call customers`}
          </p>
          {pendingCalls > 0 && (
            <div className={`mt-2 px-2 py-1 text-xs font-medium rounded-full w-fit ${
              pendingCalls > 3 
                ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' 
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
            }`}>
              📞 Action needed
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmed Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed Today</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{confirmedToday}</div>
          <p className="text-xs text-muted-foreground">
            Appointments scheduled for today
          </p>
        </CardContent>
      </Card>

      {/* Today's Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(totalRevenue / 100).toLocaleString('en-CA', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground">
            From all pending & confirmed bookings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookingSummary } from '@/components/booking/booking-summary'
import { toast } from 'sonner'
import type { BookingWithDetails, Staff } from '@/lib/types'

interface RealtimeConfirmationProps {
  initialBooking: BookingWithDetails
  token: string
  staffList: Staff[]
  imageUrls: string[]
}

export function RealtimeConfirmation({
  initialBooking,
  token,
  staffList,
  imageUrls,
}: RealtimeConfirmationProps) {
  const [booking, setBooking] = useState(initialBooking)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`confirm-${token}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `confirmation_token=eq.${token}`,
        },
        (payload) => {
          const updated = payload.new as any

          setBooking((prev) => {
            const next = { ...prev }

            // Update mutable fields
            if (updated.status) next.status = updated.status
            if (updated.booking_time) next.booking_time = updated.booking_time
            if (updated.staff_id !== undefined) {
              next.staff_id = updated.staff_id
              if (updated.staff_id) {
                const found = staffList.find((s) => s.id === updated.staff_id)
                next.staff = found ? { id: found.id, name: found.name } : null
              } else {
                next.staff = null
              }
            }
            if (updated.notes !== undefined) next.notes = updated.notes

            return next
          })

          // Notify the customer
          if (updated.status === 'confirmed') {
            toast.success('Your booking has been confirmed!')
          } else if (updated.status === 'cancelled') {
            toast.error('Your booking has been cancelled.')
          } else if (updated.booking_time) {
            toast.info('Your appointment time has been updated.')
          } else if (updated.staff_id !== undefined) {
            toast.info('Your assigned staff has been updated.')
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [token, staffList])

  return <BookingSummary booking={booking} imageUrls={imageUrls} />
}

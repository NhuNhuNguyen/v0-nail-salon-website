'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cancelBooking } from '@/app/booking/deposit/[token]/actions'

interface BackToBookingButtonProps {
  bookingId: string
  token: string
}

export function BackToBookingButton({ bookingId, token }: BackToBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      await cancelBooking(bookingId, token)
      router.push('/booking')
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Booking
      </button>

      <AlertDialog open={open} onOpenChange={(v) => { if (!isPending) setOpen(v) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Going back will cancel your current booking. You&apos;ll need to start a new booking if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Stay on page</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="hover:bg-destructive/90"
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling…</>
              ) : (
                'Yes, cancel booking'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

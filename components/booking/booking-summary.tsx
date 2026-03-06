import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { BookingWithDetails } from '@/lib/types'
import { CalendarDays, Clock, Phone, User, Hash, UserCheck, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react'

interface BookingSummaryProps {
  booking: BookingWithDetails
  imageUrls?: string[]
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

export function BookingSummary({ booking, imageUrls }: BookingSummaryProps) {
  const total = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(booking.estimated_total / 100)

  const arrivalDate = new Date(booking.booking_time).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const arrivalTime = new Date(booking.booking_time).toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
  })

  const bookedOn = new Date(booking.created_at).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Status + ID */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span className="font-mono">{booking.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <Badge variant={statusVariant[booking.status] ?? 'outline'}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>

        {/* Customer details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{arrivalDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{arrivalTime}</span>
          </div>
          {booking.staff && (
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span>{booking.staff.name}</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Booked on {bookedOn}
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Services</h3>
          <ul className="space-y-1">
            {booking.booking_services.map((bs) => (
              <li key={bs.id} className="flex items-center justify-between text-sm">
                <span>{bs.service.name}</span>
                <span className="text-muted-foreground">{bs.service.price_display}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reference images */}
        {imageUrls && imageUrls.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Reference Images</h3>
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-16 w-16 overflow-hidden rounded-md border border-border"
                >
                  <Image
                    src={url}
                    alt={`Reference ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm font-medium text-muted-foreground">Estimated Total</span>
          <span className="font-serif text-2xl text-foreground">{total}+</span>
        </div>

        {/* Deposit status */}
        {booking.deposit_amount != null && booking.deposit_amount > 0 && (
          <div className={`rounded-lg p-3 text-sm ${
            booking.deposit_uploaded_at
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
          }`}>
            <div className="flex items-center gap-2">
              {booking.deposit_uploaded_at ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="font-medium">
                Deposit: {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(booking.deposit_amount / 100)}
              </span>
            </div>
            {booking.deposit_uploaded_at ? (
              <p className="mt-1 text-xs opacity-80">
                Payment screenshot submitted on{' '}
                {new Date(booking.deposit_uploaded_at).toLocaleDateString('en-CA', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            ) : (
              <p className="mt-1 text-xs opacity-80">
                Deposit payment screenshot has not been uploaded yet.{' '}
                <Link
                  href={`/booking/deposit/${booking.confirmation_token}`}
                  className="underline font-medium"
                >
                  Upload now
                </Link>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

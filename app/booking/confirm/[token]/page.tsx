import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, LinkIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { RealtimeConfirmation } from '@/components/booking/realtime-confirmation'
import type { BookingWithDetails, Staff } from '@/lib/types'

interface ConfirmPageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: ConfirmPageProps): Promise<Metadata> {
  return {
    title: 'Booking Confirmed | MK Fashion Nails & Spa',
    description: 'Your booking has been confirmed. Save this page for your visit.',
  }
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { token } = await params

  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(name, phone),
      booking_services(
        id,
        booking_id,
        service_id,
        price_at_booking,
        service:services(name, category, price_display)
      )
    `)
    .eq('confirmation_token', token)
    .single()

  if (error || !booking) notFound()

  // Fetch staff list for resolving staff names on realtime updates
  const { data: staffList } = await supabase
    .from('staff')
    .select('*')
    .eq('active', true)
    .order('name')

  // Generate signed URLs for reference images (service role bypasses RLS)
  const imagePaths: string[] = booking.sample_image_paths ?? []
  const imageUrls: string[] = []
  if (imagePaths.length > 0) {
    const admin = createAdminClient()
    for (const path of imagePaths) {
      const { data } = await admin.storage
        .from('booking-images')
        .createSignedUrl(path, 60 * 60)
      if (data?.signedUrl) imageUrls.push(data.signedUrl)
    }
  }

  // Reshape the nested Supabase response to match our type
  const shaped: BookingWithDetails = {
    id: booking.id,
    customer_id: booking.customer_id,
    staff_id: booking.staff_id ?? null,
    confirmation_token: booking.confirmation_token,
    status: booking.status,
    estimated_total: booking.estimated_total,
    deposit_amount: booking.deposit_amount,
    notes: booking.notes,
    sample_image_paths: booking.sample_image_paths ?? [],
    booking_time: booking.booking_time,
    created_at: booking.created_at,
    customer: booking.customer as BookingWithDetails['customer'],
    staff: null, // resolved on client from staff list
    booking_services: (booking.booking_services as any[]).map((bs: any) => ({
      id: bs.id,
      booking_id: bs.booking_id,
      service_id: bs.service_id,
      price_at_booking: bs.price_at_booking,
      service: bs.service,
    })),
  }

  // Resolve staff name from the booking's staff_id
  if (booking.staff_id && staffList) {
    const found = staffList.find((s: any) => s.id === booking.staff_id)
    if (found) {
      shaped.staff = { id: found.id, name: found.name }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8 space-y-2 text-center">
          <h1 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Booking Confirmed
          </h1>
          <p className="text-muted-foreground">
            Thank you! Here are your booking details.
          </p>
        </div>

        {/* Realtime-enabled summary */}
        <RealtimeConfirmation
          initialBooking={shaped}
          token={token}
          staffList={(staffList as Staff[]) ?? []}
          imageUrls={imageUrls}
        />

        {/* Save hint */}
        <div className="mt-6 flex items-start gap-2 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
          <LinkIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Save this link</strong> — you can re-open it on your phone when you arrive at the salon.
          </p>
        </div>

        {/* Book another */}
        <div className="mt-6 text-center">
          <Link
            href="/booking"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Book another appointment →
          </Link>
        </div>
      </div>
    </div>
  )
}

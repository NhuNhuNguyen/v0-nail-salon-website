import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { CopyLinkHint } from '@/components/booking/copy-link-hint'
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
    deposit_image_path: booking.deposit_image_path ?? null,
    deposit_uploaded_at: booking.deposit_uploaded_at ?? null,
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
            Booking Request Submitted
          </h1>
          <p className="text-muted-foreground">
            Thank you! Our team will review your booking and contact you shortly.
          </p>
        </div>

        {/* Pending confirmation notice */}
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5.5H2a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 001.5 1.5h16a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 00-1.5-1.5zm-5.5 9a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Admin will call to confirm</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Our salon staff will contact you at <strong>{booking.customer.phone}</strong> to confirm your appointment time. No deposit required!
              </p>
            </div>
          </div>
        </div>

        {/* Realtime-enabled summary */}
        <RealtimeConfirmation
          initialBooking={shaped}
          token={token}
          staffList={(staffList as Staff[]) ?? []}
          imageUrls={imageUrls}
        />

        {/* Save hint – click to copy URL */}
        <CopyLinkHint />

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

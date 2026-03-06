import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DepositUpload } from '@/components/booking/deposit-upload'
import { BackToBookingButton } from '@/components/booking/back-to-booking-button'
import type { PaymentInfo } from '@/lib/types'

interface DepositPageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Deposit Payment | MK Fashion Nails & Spa',
    description: 'Upload your deposit payment screenshot to confirm your booking.',
  }
}

export default async function DepositPage({ params }: DepositPageProps) {
  const { token } = await params

  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id,
      confirmation_token,
      status,
      estimated_total,
      deposit_amount,
      deposit_image_path,
      deposit_uploaded_at,
      booking_time,
      customer:customers(name, phone),
      booking_services(
        id,
        service:services(name, price_display)
      )
    `)
    .eq('confirmation_token', token)
    .single()

  if (error || !booking) notFound()

  // If deposit already uploaded, redirect to confirmation page
  if (booking.deposit_image_path) {
    const { redirect } = await import('next/navigation')
    redirect(`/booking/confirm/${token}`)
  }

  // Fetch payment info from settings
  const { data: paymentSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'deposit_payment_info')
    .single()

  const paymentInfo: PaymentInfo = paymentSetting?.value ?? {
    method: 'Bank Transfer',
    details: 'Please contact us for payment details.',
  }

  let qrCodeUrl: string | undefined
  if (paymentInfo.qr_code_path) {
    const admin = createAdminClient()
    const { data } = await admin.storage
      .from('booking-images')
      .createSignedUrl(paymentInfo.qr_code_path, 60 * 60 * 2) // 2-hour URL
    qrCodeUrl = data?.signedUrl
  }

  const depositAmountCents = booking.deposit_amount ?? 0

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12 lg:px-8">
        <BackToBookingButton bookingId={booking.id} token={token} />

        <div className="mb-8 space-y-2 text-center">
          <h1 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Deposit Payment
          </h1>
          <p className="text-muted-foreground">
            Please send the deposit and upload a screenshot of your payment to confirm your booking.
          </p>
        </div>

        <DepositUpload
          token={token}
          bookingId={booking.id}
          depositAmountCents={depositAmountCents}
          estimatedTotalCents={booking.estimated_total}
          paymentInfo={paymentInfo}
          qrCodeUrl={qrCodeUrl}
          services={(booking.booking_services as any[]).map((bs: any) => ({
            name: bs.service.name,
            priceDisplay: bs.service.price_display,
          }))}
          bookingTime={booking.booking_time}
          customerName={(booking.customer as any).name}
        />
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getActiveServices } from '@/lib/data/services'
import { createClient } from '@/lib/supabase/server'
import { BookingForm } from '@/components/booking/booking-form'
import { Header } from '@/components/header'
import type { Staff } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Book an Appointment | MK Fashion Nails & Spa',
  description: 'Book your nail appointment online. Select services and get an instant price estimate.',
}

export default async function BookingPage() {
  const supabase = await createClient()
  const [services, { data: staff }] = await Promise.all([
    getActiveServices(),
    supabase.from('staff').select('*').eq('active', true).order('name'),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-12 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Page header */}
        <div className="mb-8 space-y-2">
          <h1 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Book an Appointment
          </h1>
          <p className="text-muted-foreground">
            Select the services you&apos;d like and we&apos;ll have everything ready for your visit.
          </p>
        </div>

        {/* Form */}
        <BookingForm services={services} staff={(staff as Staff[]) ?? []} />
      </div>
    </div>
  )
}

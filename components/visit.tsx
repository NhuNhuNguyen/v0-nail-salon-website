import { MapPin, Phone, Clock } from "lucide-react"

export function Visit() {
  return (
    <section id="visit" className="bg-foreground py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <h2 className="text-center font-serif text-3xl leading-tight text-primary-foreground md:text-4xl">
          Visit MK Fashion Nails & Spa
        </h2>
        <p className="mt-3 text-center text-base text-primary-foreground/70">
          Walk in anytime — we&apos;ll take care of you.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {/* Address */}
          <div className="flex flex-col items-center rounded-2xl bg-primary-foreground/10 p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              Address
            </h3>
            <p className="mt-2 text-base font-medium text-primary-foreground">
              579 Markham Rd, Scarborough
            </p>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center rounded-2xl bg-primary-foreground/10 p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Phone className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              Phone
            </h3>
            <p className="mt-2 text-base font-medium text-primary-foreground">
              Call to book or ask about wait time
            </p>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center rounded-2xl bg-primary-foreground/10 p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Clock className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              Hours
            </h3>
            <div className="mt-2 text-base text-primary-foreground">
              <p className="font-medium">Mon–Sat: 10 AM – 8 PM</p>
              <p className="font-medium">Sun: 11 AM – 6 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="tel:+1"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <Phone className="h-5 w-5" />
            Call to Book or Walk In Today
          </a>
        </div>
      </div>
    </section>
  )
}

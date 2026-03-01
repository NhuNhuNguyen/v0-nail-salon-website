import Image from "next/image"
import { Phone } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-foreground pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/nails-french-crystals.jpg"
          alt="Elegant French tip nails with crystal accents by MK Fashion Nails"
          fill
          priority
          className="object-cover opacity-25"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
            Walk-Ins Welcome
          </span>
          <h1 className="font-serif text-4xl leading-tight text-background md:text-5xl lg:text-6xl text-balance">
            Nails Done Right,
            <br />
            Built to Last
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-background/80">
            At MK Fashion Nails & Spa near{" "}
            <strong className="text-primary">Markham & Lawrence</strong>, we
            take our time to do nails that hold up through real life — work,
            cooking, cleaning, and everything in between.
          </p>
          <p className="mt-3 text-base font-medium text-background/60">
            No rushing. No surprise prices. Quality work you can count on.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="tel:+16473368999"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
            >
              <Phone className="h-5 w-5" />
              Call to Book
            </a>
            <a
              href="#services"
              className="inline-flex items-center rounded-full border border-background/30 px-8 py-3.5 text-base font-semibold text-background transition-colors hover:bg-background/10"
            >
              View Services
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

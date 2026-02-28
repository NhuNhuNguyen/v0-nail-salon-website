import Image from "next/image"
import { Phone } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-foreground pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-nails.jpg"
          alt="Beautiful glossy Bio-Gel nails"
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary-foreground">
            14-Day Guarantee
          </span>
          <h1 className="font-serif text-4xl leading-tight text-primary-foreground md:text-5xl lg:text-6xl text-balance">
            Nails That Stay Fresh
            <br />
            for 14 Days
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
            At MK Fashion Nails & Spa near{" "}
            <strong className="text-primary-foreground">Markham & Lawrence</strong>, we
            do nails that last through real life — work, cooking, cleaning, and
            everything in between.
          </p>
          <p className="mt-3 text-base font-medium text-primary-foreground/70">
            No rushing. No surprise prices. Just solid, beautiful nails.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="tel:+1"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
            >
              <Phone className="h-5 w-5" />
              Call to Book
            </a>
            <a
              href="#services"
              className="inline-flex items-center rounded-full border border-primary-foreground/30 px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              View Services
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

import Image from "next/image"
import { Check, ShieldCheck } from "lucide-react"

const benefits = [
  "Careful nail prep for stronger hold",
  "Quality Bio-Gel and Acrylic products",
  "Proper curing time — we never rush",
  "Experienced techs who understand daily wear",
]

export function WhyUs() {
  return (
    <section id="why-us" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/nails-pink-floral.jpg"
              alt="Pink ombre nails with floral accents and crystals by MK Fashion Nails"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
              Why Our Nails Last Longer
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Tired of nails that chip after a few days? Many clients come to us
              after bad experiences — rushed work, weak products, or hidden
              costs. At MK Fashion Nails & Spa, durability comes first.
            </p>

            <ul className="mt-8 flex flex-col gap-4" role="list">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-base text-foreground">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-secondary p-5">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <p className="text-base leading-relaxed text-foreground">
                <strong>Our promise:</strong> Your nails stay fresh and chip-free
                for at least <strong>14 days</strong>, or we&apos;ll fix it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

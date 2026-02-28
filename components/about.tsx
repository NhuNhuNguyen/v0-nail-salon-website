import { Check } from "lucide-react"

const perks = [
  "Walk-ins always welcome",
  "Fast but careful service",
  "Fair, honest prices",
  "Friendly team that understands our community",
  "Comfortable, neighborhood feel",
]

export function About() {
  return (
    <section id="about" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
            The Scarborough Vibe
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We&apos;re not a fancy downtown salon — and that&apos;s why our clients
            love us. Many of our clients are from Caribbean, Indian, and Middle
            Eastern communities. We respect your time, your budget, and your
            style.
          </p>
        </div>

        <ul
          className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2"
          role="list"
        >
          {perks.map((p) => (
            <li
              key={p}
              className="flex items-center gap-3 rounded-xl bg-secondary px-5 py-4"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium text-foreground">{p}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center font-serif text-2xl text-foreground">
          Come in, relax, and leave happy.
        </p>
      </div>
    </section>
  )
}

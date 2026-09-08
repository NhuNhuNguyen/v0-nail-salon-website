import Image from "next/image"

interface ServiceItem {
  name: string
  price: string
}

interface ServiceCategory {
  title: string
  icon: string
  items: ServiceItem[]
}

const categories: ServiceCategory[] = [
  {
    title: "Nails",
    icon: "nails",
    items: [
      { name: "Acrylic", price: "$50 & Up" },
      { name: "Fill Acrylic", price: "$45 & Up" },
      { name: "UV Gel", price: "$55 & Up" },
      { name: "Fill UV Gel", price: "$50 & Up" },
      { name: "Bio Gel", price: "$60 & Up" },
      { name: "Fill Bio Gel", price: "$50 & Up" },
      { name: "White Tip", price: "$40 & Up" },
      { name: "Shellac", price: "$20 & Up" },
      { name: "Manicure", price: "$25 & Up" },
      { name: "Pedicure", price: "$35 & Up" },
      { name: "Manicure Shellac", price: "$35 & Up" },
      { name: "Reg: Mani-Pedi", price: "$55 & Up" },
      { name: "Mani-Pedi Shellac", price: "$75 & Up" },
      { name: "Nail Repair", price: "$5 & Up" },
      { name: "Kids Mani-Pedi", price: "$45 & Up" },
    ],
  },
  {
    title: "Nail Art",
    icon: "nails",
    items: [
      { name: "2 Fingers", price: "$5 & Up" },
      { name: "10 Fingers", price: "$15 & Up" },
      { name: "3D Design 2 Fingers", price: "$15 & Up" },
      { name: "French Extra", price: "$5 & Up" },
      { name: "Cut Down", price: "$7 & Up" },
      { name: "Nail Take Off", price: "$15 & Up" },
      { name: "Polish Change Hand", price: "$20 & Up" },
      { name: "Polish Change Feet", price: "$25 & Up" },
    ],
  },
  {
    title: "Waxing",
    icon: "waxing",
    items: [
      { name: "Eyebrows", price: "$10 & Up" },
      { name: "Lip", price: "$5 & Up" },
      { name: "Chin", price: "$10 & Up" },
      { name: "Side Burns", price: "$10 & Up" },
      { name: "Cheeks", price: "$7 & Up" },
      { name: "Full Face", price: "$30 & Up" },
      { name: "Full Legs", price: "$50 & Up" },
      { name: "Half Legs", price: "$30 & Up" },
      { name: "Full Arms", price: "$30 & Up" },
      { name: "Half Arms", price: "$20 & Up" },
      { name: "Under Arms", price: "$15 & Up" },
      { name: "Back", price: "$30 & Up" },
      { name: "Stomach", price: "$20 & Up" },
      { name: "Bikini Line", price: "$25 & Up" },
      { name: "Brazilian", price: "$50 & Up" },
    ],
  },
  {
    title: "Facial Care",
    icon: "facial",
    items: [
      { name: "Deep Relaxing Facial", price: "$60 & Up" },
    ],
  },
  {
    title: "Eyelash Services",
    icon: "facial",
    items: [
      { name: "Extension", price: "$45 & Up" },
      { name: "Extension Refill", price: "$25 & Up" },
      { name: "Full Set Single", price: "$100 & Up" },
      { name: "Refill Single", price: "$50 & Up" },
      { name: "Lash Full Set (Each Eye)", price: "$100 & Up" },
      { name: "Lash Refill", price: "$50 & Up / $70 & Up" },
      { name: "Tinting", price: "$10 & Up" },
    ],
  },
]

function CategoryIcon({ type }: { type: string }) {
  if (type === "nails") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
        <path d="M12 2c-1 4-4 6-4 10a4 4 0 0 0 8 0c0-4-3-6-4-10Z" />
        <path d="M12 12v10" />
      </svg>
    )
  }
  if (type === "waxing") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function Services() {
  return (
    <section id="services" className="bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Services & Prices
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Honest pricing — no hidden fees
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="rounded-2xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CategoryIcon type={cat.icon} />
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {cat.title}
                </h3>
              </div>
              <ul className="flex flex-col gap-3" role="list">
                {cat.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-semibold text-primary">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Nail art image */}
        <div className="mt-12 overflow-hidden rounded-2xl">
          <Image
            src="/images/nails-nude-sugar.jpg"
            alt="Elegant nude nails with sugar texture and gold accents by MK Fashion Nails"
            width={1200}
            height={400}
            className="w-full object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  )
}

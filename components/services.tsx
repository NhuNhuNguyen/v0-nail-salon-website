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
    title: "Acrylic Nails",
    icon: "nails",
    items: [
      { name: "Fullset Acrylic", price: "$35 & Up" },
      { name: "Refill Acrylic", price: "$30 & Up" },
    ],
  },
  {
    title: "UV Gel",
    icon: "nails",
    items: [
      { name: "Fullset UV Gel", price: "$50 & Up" },
      { name: "Refill UV Gel", price: "$40 & Up" },
    ],
  },
  {
    title: "Bio-Gel",
    icon: "nails",
    items: [
      { name: "Fullset Biogel", price: "$60 & Up" },
      { name: "Refill Biogel", price: "$50 & Up" },
    ],
  },
  {
    title: "Manicure & Pedicure",
    icon: "nails",
    items: [
      { name: "Manicure", price: "$25 - $35" },
      { name: "Pedicure", price: "$35 - $45" },
      { name: "Mani-Pedi", price: "$55 - $75" },
      { name: "Nail Pedicure", price: "$5 Each" },
    ],
  },
  {
    title: "Nail Extras",
    icon: "nails",
    items: [
      { name: "Nail Take Off", price: "$10" },
      { name: "Nail Art Designs", price: "$10 & Up" },
      { name: "White Tip", price: "$15 & Up" },
      { name: "Cut Down", price: "$5" },
      { name: "Polish Change", price: "$10 & Up" },
    ],
  },
  {
    title: "Facial & Eyes",
    icon: "waxing",
    items: [
      { name: "Facial", price: "$60 & Up" },
      { name: "Eyelash Extension", price: "$45 - $100+" },
      { name: "Threading", price: "$10" },
    ],
  },
  {
    title: "Face Waxing",
    icon: "waxing",
    items: [
      { name: "Eye Brow", price: "$10 & Up" },
      { name: "Full Face", price: "$30 & Up" },
      { name: "Upper Lip", price: "$5 & Up" },
      { name: "Chin", price: "$10 & Up" },
    ],
  },
  {
    title: "Body Waxing",
    icon: "waxing",
    items: [
      { name: "Half Arm", price: "$25 & Up" },
      { name: "Full Arm", price: "$35 & Up" },
      { name: "Underarm", price: "$15 & Up" },
      { name: "Stomach", price: "$20 & Up" },
      { name: "Back", price: "$30 & Up" },
      { name: "Bikini Line", price: "$25 & Up" },
      { name: "Brazilian", price: "$45 & Up" },
      { name: "Half Leg", price: "$35 & Up" },
      { name: "Full Leg", price: "$50 & Up" },
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
            src="/images/nail-art.jpg"
            alt="Colorful custom nail art designs showcase"
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

import Image from "next/image"

const photos = [
  {
    src: "/images/nails-french-crystals.jpg",
    alt: "Elegant nude French tip coffin nails with crystal and rhinestone accents",
    label: "French Tip & Crystals",
  },
  {
    src: "/images/nails-pink-floral.jpg",
    alt: "Pink ombre coffin nails with 3D white floral designs and gem embellishments",
    label: "Pink Floral Ombre",
  },
  {
    src: "/images/nails-bw-geometric.jpg",
    alt: "Bold black and white geometric coffin nails with crystal bow accents",
    label: "Black & White Geometric",
  },
  {
    src: "/images/nails-nude-sugar.jpg",
    alt: "Soft nude almond nails with sugar crystal texture and gold line art",
    label: "Nude Sugar Crystal",
  },
]

export function Gallery() {
  return (
    <section id="gallery" className="bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
            Our Work
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Real nails done right here at MK Fashion Nails & Spa in Scarborough.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {photos.map((photo) => (
            <figure key={photo.src} className="group relative overflow-hidden rounded-2xl">
              <div className="relative aspect-square">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-foreground/70 px-3 py-2.5 text-center text-sm font-medium text-background backdrop-blur-sm transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                {photo.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

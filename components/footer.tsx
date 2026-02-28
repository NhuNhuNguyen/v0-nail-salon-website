export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="mx-auto max-w-6xl px-4 text-center lg:px-8">
        <p className="font-serif text-lg text-foreground">
          MK Fashion Nails & Spa
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          579 Markham Rd, Scarborough &middot; Mon–Sat 10–8 &middot; Sun 11–6
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MK Fashion Nails & Spa. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

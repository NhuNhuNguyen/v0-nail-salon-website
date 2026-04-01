import type { Service } from '@/lib/types'

interface PriceDisplayProps {
  services: Service[]
  selectedIds: Set<string>
}

export function PriceDisplay({ services, selectedIds }: PriceDisplayProps) {
  if (selectedIds.size === 0) return null

  const totalCents = services
    .filter((s) => selectedIds.has(s.id))
    .reduce((sum, s) => sum + s.price_min, 0)

  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(totalCents / 100)

  return (
    <div className="rounded-lg bg-secondary p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Estimated Total ({selectedIds.size} {selectedIds.size === 1 ? 'service' : 'services'})
        </span>
        <span className="font-serif text-2xl text-foreground">{formatted}+</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Final price may vary based on design complexity and nail length.
      </p>
    </div>
  )
}

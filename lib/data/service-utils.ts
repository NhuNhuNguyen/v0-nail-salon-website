import type { Service } from '@/lib/types'

/** Group a flat services array by category, preserving sort order. */
export function groupByCategory(services: Service[]) {
  const map = new Map<string, Service[]>()
  for (const s of services) {
    const arr = map.get(s.category) ?? []
    arr.push(s)
    map.set(s.category, arr)
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }))
}

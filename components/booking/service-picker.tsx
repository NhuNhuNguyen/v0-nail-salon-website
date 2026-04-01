'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Service } from '@/lib/types'
import { groupByCategory } from '@/lib/data/service-utils'

interface ServicePickerProps {
  services: Service[]
  selected: Set<string>
  onToggle: (serviceId: string) => void
}

export function ServicePicker({ services, selected, onToggle }: ServicePickerProps) {
  const groups = groupByCategory(services)

  return (
    <div className="space-y-6">
      {groups.map(({ category, items }) => (
        <fieldset key={category} className="space-y-3">
          <legend className="font-serif text-lg text-foreground">{category}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((service) => (
              <label
                key={service.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <Checkbox
                  checked={selected.has(service.id)}
                  onCheckedChange={() => onToggle(service.id)}
                />
                <span className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{service.name}</span>
                  <span className="text-sm text-muted-foreground">{service.price_display}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

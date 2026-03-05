'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, startOfDay, setHours, setMinutes } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServicePicker } from '@/components/booking/service-picker'
import { PriceDisplay } from '@/components/booking/price-display'
import { createBooking } from '@/app/booking/actions'
import type { Service, Staff } from '@/lib/types'
import { CalendarDays, Clock, Loader2, User, ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Generate time slots from 9:30 AM to 7:00 PM in 30-min increments
function generateTimeSlots() {
  const slots: { label: string; value: string }[] = []
  for (let h = 9; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 9 && m === 0) continue // start at 9:30
      if (h === 19 && m === 30) continue // end at 7:00
      const date = setMinutes(setHours(new Date(2000, 0, 1), h), m)
      slots.push({
        label: format(date, 'h:mm a'),
        value: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

interface BookingFormProps {
  services: Service[]
  staff: Staff[]
}

export function BookingForm({ services, staff }: BookingFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 30)

  function handleToggle(serviceId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(serviceId)) next.delete(serviceId)
      else next.add(serviceId)
      return next
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
    setFiles((prev) => {
      const combined = [...prev, ...incoming].slice(0, MAX_IMAGES)
      return combined.filter((f) => f.size <= MAX_FILE_SIZE && f.type.startsWith('image/'))
    })
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Please enter your name.')
    if (!phone.trim()) return setError('Please enter your phone number.')
    if (!selectedDate) return setError('Please select a date for your visit.')
    if (!selectedTime) return setError('Please select a time for your visit.')
    if (selectedIds.size === 0) return setError('Please select at least one service.')

    // Build ISO datetime from date + time
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const bookingDate = setMinutes(setHours(selectedDate, hours), minutes)

    const formData = new FormData()
    formData.set('customerName', name.trim())
    formData.set('phone', phone.trim())
    formData.set('bookingTime', bookingDate.toISOString())
    formData.set('serviceIds', JSON.stringify(Array.from(selectedIds)))
    formData.set('staffId', selectedStaff && selectedStaff !== 'none' ? selectedStaff : '')
    for (const file of files) {
      formData.append('images', file)
    }

    setSubmitting(true)
    try {
      const result = await createBooking(formData)

      if (result.error) {
        setError(result.error)
        setSubmitting(false)
        return
      }

      router.push(`/booking/confirm/${result.confirmationToken}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer info */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-foreground">Your Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(647) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Date & Time selection */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-foreground">Choose Date &amp; Time</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'EEE, MMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setCalendarOpen(false)
                  }}
                  disabled={(date) => date < today || date > maxDate}
                  defaultMonth={today}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className={cn('w-full', !selectedTime && 'text-muted-foreground')}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <SelectValue placeholder="Pick a time" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preferred staff (optional) */}
      {staff.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl text-foreground">Preferred Staff (Optional)</h2>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className={cn('w-full', !selectedStaff && 'text-muted-foreground')}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder="No preference" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No preference</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Service selection */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-foreground">Select Services</h2>
        <ServicePicker services={services} selected={selectedIds} onToggle={handleToggle} />
      </div>

      {/* Price summary */}
      <PriceDisplay services={services} selectedIds={selectedIds} />

      {/* Reference images (optional) */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-foreground">Reference Images (Optional)</h2>
        <p className="text-sm text-muted-foreground">
          Upload up to {MAX_IMAGES} reference images to show the style you&apos;d like. Max 5 MB each.
        </p>

        <label
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary/50',
            files.length >= MAX_IMAGES && 'pointer-events-none opacity-50',
          )}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {files.length >= MAX_IMAGES ? 'Maximum images reached' : 'Click to select images'}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={files.length >= MAX_IMAGES}
          />
        </label>

        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Reference ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      {/* Submit */}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Booking…
          </>
        ) : (
          'Confirm Booking'
        )}
      </Button>
    </form>
  )
}

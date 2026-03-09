"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Star, CalendarDays } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { submitReview } from "@/app/actions/reviews"
import type { Review, Staff } from "@/lib/types"

function StarRating({
  rating,
  interactive = false,
  onRate,
}: {
  rating: number
  interactive?: boolean
  onRate?: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-0.5" role="group" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || rating)
                ? "fill-primary text-primary"
                : "fill-none text-border"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function formatReviewDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

interface ReviewsProps {
  initialReviews: Review[]
  staff: Staff[]
}

export function Reviews({ initialReviews, staff }: ReviewsProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [service, setService] = useState("")
  const [dateOfService, setDateOfService] = useState<Date | undefined>(undefined)
  const [staffId, setStaffId] = useState<string>("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !text.trim() || rating === 0) return

    setSubmitting(true)
    setError(null)

    const result = await submitReview({
      name: name.trim(),
      rating,
      text: text.trim(),
      service: service.trim() || "General",
      date_of_service: dateOfService ? format(dateOfService, "yyyy-MM-dd") : null,
      staff_id: staffId || null,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setName("")
    setRating(0)
    setText("")
    setService("")
    setDateOfService(undefined)
    setStaffId("")
    setShowForm(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section id="reviews" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Real reviews from real customers in Scarborough
          </p>
        </div>

        {/* Reviews carousel */}
        <Carousel
          opts={{ align: "start", loop: false }}
          className="mt-12"
        >
          <CarouselContent className="-ml-4">
            {initialReviews.map((review) => (
              <CarouselItem
                key={review.id}
                className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3"
              >
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {formatReviewDate(review.created_at)}
                    </span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {review.name.charAt(0)}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {review.name}
                      </span>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {review.service}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselPrevious className="-left-4 hidden sm:flex" />
          <CarouselNext className="-right-4 hidden sm:flex" /> */}
        </Carousel>

        {/* Success message */}
        {submitted && (
          <div className="mt-6 rounded-xl bg-primary/10 p-4 text-center text-sm font-medium text-primary">
            Thank you for your feedback! We truly appreciate it and will use it to further enhance our service.
          </div>
        )}

        {/* Add review button / form */}
        <div className="mt-10 flex flex-col items-center">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-8 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Star className="h-5 w-5" />
              Share Your Experience
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground">
                Leave a Review
              </h3>

              <div className="mt-4 flex flex-col gap-4">
                {/* Rating */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Rating <span className="text-primary">*</span>
                  </label>
                  <StarRating
                    rating={rating}
                    interactive
                    onRate={setRating}
                  />
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="review-name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Your Name <span className="text-primary">*</span>
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah K."
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Service */}
                <div>
                  <label
                    htmlFor="review-service"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Service You Got
                  </label>
                  <input
                    id="review-service"
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="e.g. Bio-Gel Fullset, Mani-Pedi..."
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Staff (optional) */}
                {staff.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Staff Member
                    </label>
                    <Select value={staffId} onValueChange={setStaffId}>
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Select staff (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date of service (optional) */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Date of Visit
                  </label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex w-full items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {dateOfService
                          ? format(dateOfService, "MMM d, yyyy")
                          : <span className="text-muted-foreground">Select date (optional)</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfService}
                        onSelect={(date) => {
                          setDateOfService(date)
                          setCalendarOpen(false)
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Review text */}
                <div>
                  <label
                    htmlFor="review-text"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Your Review <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="review-text"
                    required
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!name.trim() || !text.trim() || rating === 0 || submitting}
                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-full px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

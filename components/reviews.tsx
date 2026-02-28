"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface Review {
  id: number
  name: string
  rating: number
  text: string
  date: string
  service: string
}

const initialReviews: Review[] = [
  {
    id: 1,
    name: "Tanya M.",
    rating: 5,
    text: "Best nail shop in Scarborough, hands down. My Bio-Gel set lasted 3 weeks with zero lifting. The staff are so friendly and patient with designs.",
    date: "Feb 2026",
    service: "Bio-Gel Fullset",
  },
  {
    id: 2,
    name: "Priya S.",
    rating: 5,
    text: "Walk-in on a Saturday and they got me in within 15 minutes. Great mani-pedi, very clean, fair prices. I keep coming back!",
    date: "Jan 2026",
    service: "Mani-Pedi",
  },
  {
    id: 3,
    name: "Keisha R.",
    rating: 5,
    text: "I drove from Brampton for these nails and it was worth it. The nail art is incredible and the price is so reasonable compared to downtown shops.",
    date: "Jan 2026",
    service: "Acrylic + Nail Art",
  },
]

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

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [service, setService] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !text.trim() || rating === 0) return

    const newReview: Review = {
      id: Date.now(),
      name: name.trim(),
      rating,
      text: text.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      service: service.trim() || "General",
    }

    setReviews((prev) => [newReview, ...prev])
    setName("")
    setRating(0)
    setText("")
    setService("")
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

        {/* Reviews grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {review.date}
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
          ))}
        </div>

        {/* Success message */}
        {submitted && (
          <div className="mt-6 rounded-xl bg-primary/10 p-4 text-center text-sm font-medium text-primary">
            Thank you for your review! We appreciate your feedback.
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

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!name.trim() || !text.trim() || rating === 0}
                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    Submit Review
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

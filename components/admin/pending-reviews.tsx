'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Star, Check, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { updateReviewStatus, fetchReviewById } from '@/app/admin/reviews/actions'
import type { Review } from '@/lib/types'

interface PendingReviewsProps {
  initialReviews: Review[]
}

export function PendingReviews({ initialReviews }: PendingReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-reviews-pending')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        async (payload) => {
          // New submission — fetch with joined staff then prepend
          const { data } = await fetchReviewById(payload.new.id as string)
          if (data && data.status === 'pending') {
            setReviews((prev) => [data, ...prev])
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reviews' },
        (payload) => {
          const updated = payload.new as Review
          if (updated.status !== 'pending') {
            // Moved out of pending — remove from this list
            setReviews((prev) => prev.filter((r) => r.id !== updated.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleAction(reviewId: string, status: 'published' | 'archived') {
    setLoading(reviewId)
    const result = await updateReviewStatus(reviewId, status)
    setLoading(null)
    if (!result.error) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No pending reviews.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {review.name.charAt(0)}
                </span>
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {review.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? 'fill-primary text-primary'
                              : 'fill-none text-border'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-foreground">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                  {review.service}
                </span>
                {review.staff && (
                  <span>Staff: {review.staff.name}</span>
                )}
                {review.date_of_service && (
                  <span>
                    Visit: {format(new Date(review.date_of_service), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(review.id, 'published')}
                disabled={loading === review.id}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(review.id, 'archived')}
                disabled={loading === review.id}
              >
                <Archive className="mr-1 h-3.5 w-3.5" />
                Archive
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

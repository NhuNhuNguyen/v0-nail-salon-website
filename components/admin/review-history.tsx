'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Star, Archive, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { updateReviewStatus, fetchReviewById, deleteReview } from '@/app/admin/reviews/actions'
import type { Review } from '@/lib/types'

type Tab = 'published' | 'archived'

interface ReviewHistoryProps {
  initialReviews: Review[]
}

export function ReviewHistory({ initialReviews }: ReviewHistoryProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [activeTab, setActiveTab] = useState<Tab>('published')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = reviews.filter((r) => r.status === activeTab)
  const publishedCount = reviews.filter((r) => r.status === 'published').length
  const archivedCount = reviews.filter((r) => r.status === 'archived').length

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-reviews-history')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reviews' },
        async (payload) => {
          const updated = payload.new as Review
          if (updated.status === 'pending') {
            // Moved back to pending — remove from history
            setReviews((prev) => prev.filter((r) => r.id !== updated.id))
          } else {
            // Status changed within history or arrived from pending — upsert with joined staff
            const { data } = await fetchReviewById(updated.id)
            if (data) {
              setReviews((prev) => {
                const exists = prev.some((r) => r.id === data.id)
                if (exists) {
                  return prev.map((r) => (r.id === data.id ? data : r))
                }
                return [data, ...prev]
              })
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleAction(reviewId: string, newStatus: 'published' | 'archived') {
    setLoading(reviewId)
    const result = await updateReviewStatus(reviewId, newStatus)
    setLoading(null)
    if (!result.error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r)),
      )
    }
  }

  async function handleDelete(reviewId: string) {
    setLoading(reviewId)
    const result = await deleteReview(reviewId)
    setLoading(null)
    if (!result.error) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
        <button
          onClick={() => setActiveTab('published')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'published'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'archived'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Archived ({archivedCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No {activeTab} reviews.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
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
                        Visit:{' '}
                        {format(
                          new Date(review.date_of_service),
                          'MMM d, yyyy',
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {activeTab === 'published' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(review.id, 'archived')}
                      disabled={loading === review.id}
                    >
                      <Archive className="mr-1 h-3.5 w-3.5" />
                      Archive
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAction(review.id, 'published')}
                        disabled={loading === review.id}
                      >
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Re-publish
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={loading === review.id}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 data-[state=open]:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete review?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the review from{' '}
                              <strong>{review.name}</strong>. This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
                              className=" hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchPendingReviews, fetchReviewsByStatus } from './actions'
import { PendingReviews } from '@/components/admin/pending-reviews'
import { ReviewHistory } from '@/components/admin/review-history'

export const metadata: Metadata = {
  title: 'Reviews | MK Admin',
}

export default async function ReviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const [{ data: pending }, { data: history }] = await Promise.all([
    fetchPendingReviews(),
    fetchReviewsByStatus(['published', 'archived']),
  ])

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Moderate new submissions and manage published reviews.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Pending</h2>
          <p className="text-sm text-muted-foreground">
            Approve or archive customer submissions before they go live.
          </p>
        </div>
        <PendingReviews initialReviews={pending} />
      </section>

      <div className="border-t border-border" />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">History</h2>
          <p className="text-sm text-muted-foreground">
            View and re-moderate published and archived reviews.
          </p>
        </div>
        <ReviewHistory initialReviews={history} />
      </section>
    </div>
  )
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Review } from '@/lib/types'

export async function deleteReview(
  reviewId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) return { error: error.message }

  revalidatePath('/admin/reviews')
  revalidatePath('/')

  return {}
}

export async function fetchReviewById(
  reviewId: string,
): Promise<{ data: Review | null; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, staff:staff_id(id, name)')
    .eq('id', reviewId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Review }
}

export async function fetchPendingReviews(): Promise<{
  data: Review[]
  error?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, staff:staff_id(id, name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data as Review[]) ?? [] }
}

export async function fetchReviewsByStatus(
  statuses: string[],
): Promise<{ data: Review[]; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, staff:staff_id(id, name)')
    .in('status', statuses)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data as Review[]) ?? [] }
}

export async function updateReviewStatus(
  reviewId: string,
  status: 'published' | 'archived' | 'pending',
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)

  if (error) return { error: error.message }

  revalidatePath('/admin/reviews')
  revalidatePath('/admin/reviews/history')
  // Revalidate home page so published reviews update
  revalidatePath('/')

  return {}
}

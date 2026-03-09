'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitReview(formData: {
  name: string
  rating: number
  text: string
  service: string
  date_of_service: string | null
  staff_id: string | null
}): Promise<{ error?: string }> {
  const name = formData.name.trim()
  const text = formData.text.trim()
  const service = formData.service.trim() || 'General'

  if (!name || !text || formData.rating < 1 || formData.rating > 5) {
    return { error: 'Name, review text, and a rating (1–5) are required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('reviews').insert({
    name,
    rating: formData.rating,
    text,
    service,
    date_of_service: formData.date_of_service || null,
    staff_id: formData.staff_id || null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  return {}
}

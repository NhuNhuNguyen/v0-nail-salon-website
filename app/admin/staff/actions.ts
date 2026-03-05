'use server'

import { createClient } from '@/lib/supabase/server'

export async function createStaff(
  name: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Name is required.' }

  const { error } = await supabase.from('staff').insert({ name: trimmed })
  if (error) return { error: error.message }
  return {}
}

export async function updateStaff(
  id: string,
  name: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Name is required.' }

  const { error } = await supabase.from('staff').update({ name: trimmed }).eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function toggleStaffActive(
  id: string,
  active: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('staff').update({ active }).eq('id', id)
  if (error) return { error: error.message }
  return {}
}

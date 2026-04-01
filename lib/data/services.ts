import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/lib/types'

export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('sort_order')
    .order('name')

  if (error) throw error
  return data as Service[]
}

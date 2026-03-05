import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StaffTable } from '@/components/admin/staff-table'
import type { Staff } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Staff | MK Admin',
}

export default async function StaffPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/admin/login')
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .order('active', { ascending: false })
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Staff</h1>
        <p className="text-muted-foreground">
          Manage staff members who can be assigned to bookings.
        </p>
      </div>
      <StaffTable initialStaff={(staff as Staff[]) ?? []} />
    </div>
  )
}

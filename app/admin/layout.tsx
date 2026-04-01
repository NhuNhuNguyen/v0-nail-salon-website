import { AdminNav } from '@/components/admin/admin-nav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {children}
      </main>
    </div>
  )
}

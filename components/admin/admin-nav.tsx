'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/admin/login/actions'
import { CalendarDays, LogOut, Users, History, Settings } from 'lucide-react'

export function AdminNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-6">
          <span className="font-serif text-lg text-foreground">MK Admin</span>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                pathname === '/admin'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Bookings
            </Link>
            <Link
              href="/admin/history"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                pathname === '/admin/history'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="h-4 w-4" />
              History
            </Link>
            <Link
              href="/admin/staff"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                pathname === '/admin/staff'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              Staff
            </Link>
            <Link
              href="/admin/settings"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                pathname === '/admin/settings'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  )
}

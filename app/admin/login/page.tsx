import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Admin Login | MK Fashion Nails & Spa',
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Admin Login</CardTitle>
          <CardDescription>Sign in to manage bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

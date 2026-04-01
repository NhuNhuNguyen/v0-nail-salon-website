'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { changePassword } from '@/app/admin/settings/actions'

export function ChangePassword() {
  const [isPending, startTransition] = useTransition()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!newPassword) return setError('Please enter a new password.')
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')

    startTransition(async () => {
      const result = await changePassword(newPassword)
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setSuccess(false) }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setSuccess(false) }}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Password changed successfully.
            </p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

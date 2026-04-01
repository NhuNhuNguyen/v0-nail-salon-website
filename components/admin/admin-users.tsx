'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Trash2, Loader2, Shield } from 'lucide-react'
import { createAdmin, deleteAdmin } from '@/app/admin/settings/actions'

interface AdminUsersProps {
  initialUsers: { id: string; email: string; created_at: string }[]
  currentUserId: string
}

export function AdminUsers({ initialUsers, currentUserId }: AdminUsersProps) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createAdmin(email.trim(), password)
      if (result.error) {
        setError(result.error)
        return
      }
      // Add to local state optimistically
      setUsers((prev) => [
        ...prev,
        { id: crypto.randomUUID(), email: email.trim(), created_at: new Date().toISOString() },
      ])
      setEmail('')
      setPassword('')
      setAddOpen(false)
    })
  }

  function handleDelete(userId: string) {
    startTransition(async () => {
      const result = await deleteAdmin(userId)
      if (result.error) {
        setError(result.error)
        setDeleteTarget(null)
        return
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setDeleteTarget(null)
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Admin Users
          </CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{u.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(u.created_at).toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {u.id === currentUserId && (
                      <span className="ml-2 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        You
                      </span>
                    )}
                  </p>
                </div>
                {u.id !== currentUserId && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={isPending}
                    onClick={() => setDeleteTarget(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add admin dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this admin account. They will no longer be able to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

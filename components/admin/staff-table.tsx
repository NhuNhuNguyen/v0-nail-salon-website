'use client'

import { useState, useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
import { Pencil, Plus, Power } from 'lucide-react'
import { createStaff, updateStaff, toggleStaffActive } from '@/app/admin/staff/actions'
import type { Staff } from '@/lib/types'

interface StaffTableProps {
  initialStaff: Staff[]
}

export function StaffTable({ initialStaff }: StaffTableProps) {
  const [staff, setStaff] = useState(initialStaff)
  const [isPending, startTransition] = useTransition()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [dialogError, setDialogError] = useState<string | null>(null)

  function openAddDialog() {
    setEditId(null)
    setNameInput('')
    setDialogError(null)
    setDialogOpen(true)
  }

  function openEditDialog(s: Staff) {
    setEditId(s.id)
    setNameInput(s.name)
    setDialogError(null)
    setDialogOpen(true)
  }

  function handleSave() {
    const trimmed = nameInput.trim()
    if (!trimmed) {
      setDialogError('Name is required.')
      return
    }

    startTransition(async () => {
      const result = editId
        ? await updateStaff(editId, trimmed)
        : await createStaff(trimmed)

      if (result.error) {
        setDialogError(result.error)
        return
      }

      // Optimistic local update
      if (editId) {
        setStaff((prev) =>
          prev.map((s) => (s.id === editId ? { ...s, name: trimmed } : s)),
        )
      } else {
        // Reload page to get the new staff with proper ID
        window.location.reload()
      }
      setDialogOpen(false)
    })
  }

  function handleToggle(s: Staff) {
    startTransition(async () => {
      const newActive = !s.active
      const result = await toggleStaffActive(s.id, newActive)
      if (!result.error) {
        setStaff((prev) =>
          prev.map((item) =>
            item.id === s.id ? { ...item, active: newActive } : item,
          ),
        )
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {staff.filter((s) => s.active).length} active staff
        </span>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="mr-1 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {staff.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No staff yet. Add your first team member above.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id} className={!s.active ? 'opacity-60' : undefined}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>
                  <Badge variant={s.active ? 'default' : 'secondary'}>
                    {s.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      disabled={isPending}
                      onClick={() => openEditDialog(s)}
                      aria-label="Edit staff"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className={`h-8 w-8 ${
                        s.active
                          ? 'text-destructive hover:text-destructive'
                          : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                      disabled={isPending}
                      onClick={() => handleToggle(s)}
                      aria-label={s.active ? 'Deactivate staff' : 'Reactivate staff'}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Name</Label>
              <Input
                id="staff-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Staff member name"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            {dialogError && (
              <p className="text-sm text-destructive">{dialogError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {editId ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

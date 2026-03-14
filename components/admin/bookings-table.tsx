'use client'

import { useState, useTransition } from 'react'
import { format, setHours, setMinutes } from 'date-fns'
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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X, Pencil, ImageIcon, CalendarDays, Clock, User, DollarSign, Phone, CheckCircle2, History } from 'lucide-react'
import { updateBookingStatus, updateBooking, getBookingImageUrls, getCallLogs } from '@/app/admin/actions'
import type { BookingWithDetails, Staff } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatET, utcToET, etToUTC } from '@/lib/timezone'

// Same time slots as booking form
function generateTimeSlots() {
  const slots: { label: string; value: string }[] = []
  for (let h = 9; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 9 && m === 0) continue
      if (h === 19 && m === 30) continue
      const date = setMinutes(setHours(new Date(2000, 0, 1), h), m)
      slots.push({
        label: format(date, 'h:mm a'),
        value: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

interface BookingsTableProps {
  bookings: BookingWithDetails[]
  onStatusChange?: () => void
  staff: Staff[]
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

export function BookingsTable({ bookings, onStatusChange, staff }: BookingsTableProps) {
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Image lightbox state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageDialogTitle, setImageDialogTitle] = useState('Reference Images');

  // Edit modal state
  const [editTarget, setEditTarget] = useState<BookingWithDetails | null>(null)
  const [editDate, setEditDate] = useState<Date | undefined>(undefined)
  const [editTime, setEditTime] = useState('')
  const [editStaff, setEditStaff] = useState('')
  const [editCalendarOpen, setEditCalendarOpen] = useState(false)

  // Call log state
  const [callLogsTarget, setCallLogsTarget] = useState<string | null>(null)
  const [callLogsData, setCallLogsData] = useState<any[]>([])
  const [callLogsOpen, setCallLogsOpen] = useState(false)
  const [callLogsLoading, setCallLogsLoading] = useState(false)

  const handleAction = (
    id: string,
    status: 'confirmed' | 'completed' | 'cancelled',
  ) => {
    startTransition(async () => {
      await updateBookingStatus(id, status)
      onStatusChange?.()
    })
  }

  const handleViewImages = (paths: string[], title = 'Reference Images') => {
    setImageLoading(true)
    setImageDialogOpen(true)
    setImageDialogTitle(title)
    startTransition(async () => {
      const result = await getBookingImageUrls(paths)
      setImageUrls(result.urls)
      setImageLoading(false)
    })
  }

  const handleViewCallLogs = (bookingId: string) => {
    setCallLogsTarget(bookingId)
    setCallLogsOpen(true)
    setCallLogsLoading(true)
    startTransition(async () => {
      const result = await getCallLogs(bookingId)
      setCallLogsData(result.data || [])
      setCallLogsLoading(false)
    })
  }

  const openEditModal = (b: BookingWithDetails) => {
    setEditTarget(b)
    const dt = utcToET(b.booking_time)
    setEditDate(dt)
    setEditTime(`${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`)
    setEditStaff(b.staff_id ?? 'none')
  }

  const handleEditSave = () => {
    if (!editTarget || !editDate || !editTime) return

    const [hours, minutes] = editTime.split(':').map(Number)
    const newDateTime = etToUTC(setMinutes(setHours(editDate, hours), minutes))
    const staffId = editStaff && editStaff !== 'none' ? editStaff : null

    startTransition(async () => {
      await updateBooking(editTarget.id, {
        booking_time: newDateTime.toISOString(),
        staff_id: staffId,
      })
      setEditTarget(null)
      onStatusChange?.()
    })
  }

  if (bookings.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No bookings yet. They&apos;ll appear here once customers start booking.
      </p>
    )
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Services</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Deposit</TableHead>
          <TableHead>Staff</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Call Status</TableHead>
          <TableHead>Appointment</TableHead>
          <TableHead>Created</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow key={b.id}>
            <TableCell className="font-mono text-xs">
              {b.id.slice(0, 8).toUpperCase()}
            </TableCell>
            <TableCell>{b.customer.name}</TableCell>
            <TableCell>{b.customer.phone}</TableCell>
            <TableCell className="max-w-[200px]">
              <span className="line-clamp-1">
                {b.booking_services.map((bs) => bs.service.name).join(', ')}
              </span>
            </TableCell>
            <TableCell className="text-right">
              {new Intl.NumberFormat('en-CA', {
                style: 'currency',
                currency: 'CAD',
              }).format(b.estimated_total / 100)}
            </TableCell>
            <TableCell>
              {b.deposit_amount ? (
                b.deposit_uploaded_at ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto px-2 py-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    disabled={!b.deposit_image_path}
                    onClick={() => b.deposit_image_path && handleViewImages([b.deposit_image_path], 'Deposit Screenshot')}
                  >
                    <DollarSign className="mr-1 h-3 w-3" />
                    Paid
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    Pending
                  </Badge>
                )
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {b.staff?.name ?? '—'}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[b.status] ?? 'outline'}>
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>
              {b.status === 'pending' && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/20">
                  <Phone className="h-3 w-3 mr-1" />
                  Needs Call
                </Badge>
              )}
              {b.status === 'confirmed' && (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Called
                </Badge>
              )}
              {(b.status === 'completed' || b.status === 'cancelled') && (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              <div>{formatET(b.booking_time, 'MMM d, yyyy')}</div>
              <div className="text-xs">{formatET(b.booking_time, 'h:mm a')}</div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              <div>{formatET(b.created_at, 'MMM d, yyyy')}</div>
              <div>{formatET(b.created_at, 'h:mm a')}</div>
            </TableCell>
            <TableCell>
              <div className="flex h-8 items-center gap-2">
                {/* Image viewer */}
                {b.sample_image_paths.length > 0 && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="relative h-8 w-8"
                    onClick={() => handleViewImages(b.sample_image_paths)}
                    aria-label="View reference images"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {b.sample_image_paths.length}
                    </span>
                  </Button>
                )}
                {/* Call history button */}
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => handleViewCallLogs(b.id)}
                  aria-label="View call history"
                  title="View call history"
                >
                  <History className="h-4 w-4" />
                </Button>
                {/* Edit button */}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={isPending}
                    onClick={() => openEditModal(b)}
                    aria-label="Edit booking"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {/* Status actions */}
                {(b.status === 'pending') && (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:border-emerald-400 hover:bg-primary/10"
                      disabled={isPending}
                      onClick={() =>
                        handleAction(
                          b.id,
                          'completed',
                        )
                      }
                      aria-label="Mark as completed"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:border-destructive/60 hover:bg-primary/10"
                      disabled={isPending}
                      onClick={() => setCancelTarget(b.id)}
                      aria-label="Cancel booking"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Cancel confirmation dialog */}
    <AlertDialog
      open={cancelTarget !== null}
      onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the booking as cancelled. The customer will not be
            notified automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go back</AlertDialogCancel>
          <AlertDialogAction
            className="hover:bg-destructive/90"
            onClick={() => {
              if (cancelTarget) handleAction(cancelTarget, 'cancelled')
              setCancelTarget(null)
            }}
          >
            Yes, cancel booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Image lightbox dialog */}
    <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{imageDialogTitle}</DialogTitle>
        </DialogHeader>
        {imageLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading images…</div>
        ) : (
          <div className="flex flex-col gap-4">
            {imageUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Reference ${i + 1}`}
                className="w-full max-h-[70vh] rounded-lg object-contain"
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Edit booking dialog */}
    <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover open={editCalendarOpen} onOpenChange={setEditCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal')}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {editDate ? format(editDate, 'EEE, MMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editDate}
                  onSelect={(d) => {
                    setEditDate(d)
                    setEditCalendarOpen(false)
                  }}
                  defaultMonth={editDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <Select value={editTime} onValueChange={setEditTime}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <SelectValue placeholder="Pick a time" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned Staff</label>
            <Select value={editStaff} onValueChange={setEditStaff}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <SelectValue placeholder="No staff assigned" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No staff assigned</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditTarget(null)}>
            Cancel
          </Button>
          <Button onClick={handleEditSave} disabled={isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Call logs dialog */}
    <Dialog open={callLogsOpen} onOpenChange={setCallLogsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Call History</DialogTitle>
        </DialogHeader>
        {callLogsLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading call history…</div>
        ) : callLogsData.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Phone className="h-5 w-5 mx-auto mb-2 opacity-50" />
            <p>No calls logged yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {callLogsData.map((log: any) => (
              <div key={log.id} className="border-l-2 border-blue-400 pl-4 pb-4">
                <div className="text-xs text-muted-foreground">
                  {formatET(log.called_at, 'MMM d, yyyy h:mm a')}
                </div>
                {log.admin_notes && (
                  <div className="text-sm mt-1 text-foreground">
                    {log.admin_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}

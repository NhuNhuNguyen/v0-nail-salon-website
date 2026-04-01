'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
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
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  DollarSign,
} from 'lucide-react'
import {
  fetchBookingsPaginated,
  fetchAllBookingsForExport,
  type HistoryFilters,
} from '@/app/admin/history/actions'
import { getBookingImageUrls } from '@/app/admin/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BookingWithDetails, Staff } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatET } from '@/lib/timezone'

const PAGE_SIZE = 20

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

interface BookingHistoryProps {
  initialBookings: BookingWithDetails[]
  initialTotalCount: number
  staff: Staff[]
  categories: string[]
  initialFilters: {
    from: string
    to: string
    customer: string
    category: string
    staff: string
    status: string
    page: number
  }
}

export function BookingHistory({
  initialBookings,
  initialTotalCount,
  staff,
  categories,
  initialFilters,
}: BookingHistoryProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [bookings, setBookings] = useState(initialBookings)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [exporting, setExporting] = useState(false)

  // Filter state
  const [from, setFrom] = useState(initialFilters.from)
  const [to, setTo] = useState(initialFilters.to)
  const [customer, setCustomer] = useState(initialFilters.customer)
  const [category, setCategory] = useState(initialFilters.category)
  const [staffFilter, setStaffFilter] = useState(initialFilters.staff)
  const [status, setStatus] = useState(initialFilters.status)
  const [page, setPage] = useState(initialFilters.page)
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [customerDebounce, setCustomerDebounce] = useState<NodeJS.Timeout | null>(null)

  // Deposit image viewer
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const buildParams = useCallback(
    (overrides: Partial<typeof initialFilters> = {}) => {
      const p = new URLSearchParams()
      const vals = {
        from: overrides.from ?? from,
        to: overrides.to ?? to,
        customer: overrides.customer ?? customer,
        category: overrides.category ?? category,
        staff: overrides.staff ?? staffFilter,
        status: overrides.status ?? status,
        page: overrides.page ?? page,
      }
      if (vals.from) p.set('from', vals.from)
      if (vals.to) p.set('to', vals.to)
      if (vals.customer) p.set('customer', vals.customer)
      if (vals.category) p.set('category', vals.category)
      if (vals.staff) p.set('staff', vals.staff)
      if (vals.status) p.set('status', vals.status)
      if (vals.page > 1) p.set('page', String(vals.page))
      return p.toString()
    },
    [from, to, customer, category, staffFilter, status, page],
  )

  const applyFilters = useCallback(
    (overrides: Partial<typeof initialFilters> = {}) => {
      const newPage = overrides.page ?? 1
      const queryStr = buildParams({ ...overrides, page: newPage })
      router.push(`/admin/history${queryStr ? `?${queryStr}` : ''}`)
    },
    [buildParams, router],
  )

  // Fetch data when URL params change (server-side data is initial, client re-fetches on filter change)
  const fetchData = useCallback(async () => {
    const filters: HistoryFilters = {
      from: from || undefined,
      to: to || undefined,
      customer: customer || undefined,
      category: category || undefined,
      staff: staffFilter || undefined,
      status: status || undefined,
      page,
    }
    const result = await fetchBookingsPaginated(filters)
    if (!result.error) {
      setBookings(result.data)
      setTotalCount(result.totalCount)
    }
  }, [from, to, customer, category, staffFilter, status, page])

  // Sync state from URL params on navigation
  useEffect(() => {
    const pFrom = searchParams.get('from') || ''
    const pTo = searchParams.get('to') || ''
    const pCustomer = searchParams.get('customer') || ''
    const pCategory = searchParams.get('category') || ''
    const pStaff = searchParams.get('staff') || ''
    const pStatus = searchParams.get('status') || ''
    const pPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

    setFrom(pFrom)
    setTo(pTo)
    setCustomer(pCustomer)
    setCategory(pCategory)
    setStaffFilter(pStaff)
    setStatus(pStatus)
    setPage(pPage)
  }, [searchParams])

  // Re-fetch when filters change
  useEffect(() => {
    startTransition(() => {
      fetchData()
    })
  }, [fetchData])

  function handleCustomerChange(value: string) {
    setCustomer(value)
    if (customerDebounce) clearTimeout(customerDebounce)
    const t = setTimeout(() => {
      applyFilters({ customer: value, page: 1 })
    }, 400)
    setCustomerDebounce(t)
  }

  function handleFilterChange(key: string, value: string) {
    const overrides: any = { [key]: value, page: 1 }
    if (key === 'from') setFrom(value)
    if (key === 'to') setTo(value)
    if (key === 'category') setCategory(value)
    if (key === 'staff') setStaffFilter(value)
    if (key === 'status') setStatus(value)
    applyFilters(overrides)
  }

  function clearFilters() {
    setFrom('')
    setTo('')
    setCustomer('')
    setCategory('')
    setStaffFilter('')
    setStatus('')
    setPage(1)
    router.push('/admin/history')
  }

  function goToPage(p: number) {
    setPage(p)
    applyFilters({ page: p })
  }

  async function handleExport() {
    setExporting(true)
    try {
      const result = await fetchAllBookingsForExport({
        from: from || undefined,
        to: to || undefined,
        customer: customer || undefined,
        category: category || undefined,
        staff: staffFilter || undefined,
        status: status || undefined,
      })

      if (result.error || result.data.length === 0) {
        setExporting(false)
        return
      }

      const headers = [
        'Booking ID', 'Customer', 'Phone', 'Date/Time', 'Services',
        'Staff', 'Status', 'Estimated Total', 'Deposit', 'Created At',
      ]

      const rows = result.data.map((b) => [
        b.id.slice(0, 8).toUpperCase(),
        b.customer.name,
        b.customer.phone,
        formatET(b.booking_time, 'MMM d, yyyy h:mm a'),
        b.booking_services.map((bs) => bs.service.name).join(', '),
        b.staff?.name ?? '',
        b.status.charAt(0).toUpperCase() + b.status.slice(1),
        `$${(b.estimated_total / 100).toFixed(2)}`,
        b.deposit_uploaded_at ? 'Paid' : b.deposit_amount ? 'Pending' : 'N/A',
        formatET(b.created_at, 'MMM d, yyyy h:mm a'),
      ])

      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
      const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
    setExporting(false)
  }

  const handleViewDepositImage = (path: string) => {
    setImageLoading(true)
    setImageDialogOpen(true)
    startTransition(async () => {
      const result = await getBookingImageUrls([path])
      setImageUrls(result.urls)
      setImageLoading(false)
    })
  }

  const hasFilters = from || to || customer || category || staffFilter || status

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        {/* Date from */}
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn('min-w-[130px] justify-start text-left font-normal', !from && 'text-muted-foreground')}
            >
              {from ? format(new Date(from + 'T00:00:00'), 'MMM d, yyyy') : 'From date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={from ? new Date(from + 'T00:00:00') : undefined}
              onSelect={(d) => {
                const val = d ? format(d, 'yyyy-MM-dd') : ''
                handleFilterChange('from', val)
                setFromOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Date to */}
        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn('min-w-[130px] justify-start text-left font-normal', !to && 'text-muted-foreground')}
            >
              {to ? format(new Date(to + 'T00:00:00'), 'MMM d, yyyy') : 'To date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={to ? new Date(to + 'T00:00:00') : undefined}
              onSelect={(d) => {
                const val = d ? format(d, 'yyyy-MM-dd') : ''
                handleFilterChange('to', val)
                setToOpen(false)
              }}
              disabled={(d) => from ? d < new Date(from + 'T00:00:00') : false}
            />
          </PopoverContent>
        </Popover>

        {/* Customer search */}
        <Input
          placeholder="Customer name or phone"
          value={customer}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className="h-8 w-[180px]"
        />

        {/* Category */}
        <Select value={category || 'all'} onValueChange={(v) => handleFilterChange('category', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Staff */}
        <Select value={staffFilter || 'all'} onValueChange={(v) => handleFilterChange('staff', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={status || 'all'} onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || totalCount === 0}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {totalCount} booking{totalCount !== 1 ? 's' : ''} found
        {isPending && ' • Loading…'}
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No bookings match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>Services</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
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
                  <TableCell className="text-sm">
                    <div>{formatET(b.booking_time, 'MMM d, yyyy')}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatET(b.booking_time, 'h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="line-clamp-2 text-sm">
                      {b.booking_services.map((bs) => bs.service.name).join(', ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(b.estimated_total / 100)}
                  </TableCell>
                  <TableCell>
                    {b.deposit_amount ? (
                      b.deposit_uploaded_at ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto px-2 py-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                          disabled={!b.deposit_image_path}
                          onClick={() => b.deposit_image_path && handleViewDepositImage(b.deposit_image_path)}
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
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{formatET(b.created_at, 'MMM d, yyyy')}</div>
                    <div>{formatET(b.created_at, 'h:mm a')}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Deposit image viewer dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deposit Screenshot</DialogTitle>
          </DialogHeader>
          {imageLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading…</div>
          ) : (
            <div className="flex flex-col gap-4">
              {imageUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Deposit screenshot ${i + 1}`}
                  className="w-full max-h-[70vh] rounded-lg object-contain"
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

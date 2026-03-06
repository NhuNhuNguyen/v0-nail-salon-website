'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { uploadDepositScreenshot } from '@/app/booking/deposit/[token]/actions'
import { Upload, ImagePlus, X, Loader2, DollarSign, CreditCard, CalendarDays, QrCode } from 'lucide-react'
import type { PaymentInfo } from '@/lib/types'

interface DepositUploadProps {
  token: string
  bookingId: string
  depositAmountCents: number
  estimatedTotalCents: number
  paymentInfo: PaymentInfo
  qrCodeUrl?: string
  services: { name: string; priceDisplay: string }[]
  bookingTime: string
  customerName: string
}

export function DepositUpload({
  token,
  bookingId,
  depositAmountCents,
  estimatedTotalCents,
  paymentInfo,
  qrCodeUrl,
  services,
  bookingTime,
  customerName,
}: DepositUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const depositAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(depositAmountCents / 100)

  const estimatedTotal = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(estimatedTotalCents / 100)

  const arrivalDate = new Date(bookingTime).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const arrivalTime = new Date(bookingTime).toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
  })

  function handleFile(f: File) {
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.')
      return
    }
    if (!f.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    setError(null)
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = e.target.files?.[0]
    if (incoming) handleFile(incoming)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const incoming = e.dataTransfer.files?.[0]
    if (incoming) handleFile(incoming)
  }

  function removeFile() {
    setFile(null)
    setPreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Please upload a payment screenshot.')
      return
    }

    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('token', token)
    formData.set('bookingId', bookingId)
    formData.set('depositImage', file)

    try {
      const result = await uploadDepositScreenshot(formData)
      if (result?.error) {
        setError(result.error)
        setSubmitting(false)
      }
      // On success, the server action redirects
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking summary */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Booking for</span>
            <span className="font-medium">{customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{arrivalDate} at {arrivalTime}</span>
          </div>
          <div className="space-y-1">
            {services.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span className="text-muted-foreground">{s.priceDisplay}</span>
              </div>
            ))}
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Estimated Total</span>
            <span className="font-serif text-lg">{estimatedTotal}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Deposit amount */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Required Deposit</p>
              <p className="font-serif text-2xl text-foreground">{depositAmount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment info */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">{paymentInfo.method}</h3>
          </div>

          {paymentInfo.method === 'Bank Transfer' && (
            paymentInfo.bank_name || paymentInfo.account_holder || paymentInfo.account_number ? (
              <div className="space-y-2">
                {(paymentInfo.bank_name || paymentInfo.account_holder) && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {paymentInfo.bank_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">Bank</p>
                        <p className="font-medium">{paymentInfo.bank_name}</p>
                      </div>
                    )}
                    {paymentInfo.account_holder && (
                      <div>
                        <p className="text-xs text-muted-foreground">Account Holder</p>
                        <p className="font-medium">{paymentInfo.account_holder}</p>
                      </div>
                    )}
                  </div>
                )}
                {(paymentInfo.transit_number || paymentInfo.institution_number || paymentInfo.account_number) && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {paymentInfo.transit_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">Transit No.</p>
                        <p className="font-mono font-medium">{paymentInfo.transit_number}</p>
                      </div>
                    )}
                    {paymentInfo.institution_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">Institution No.</p>
                        <p className="font-mono font-medium">{paymentInfo.institution_number}</p>
                      </div>
                    )}
                    {paymentInfo.account_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">Account No.</p>
                        <p className="font-mono font-medium">{paymentInfo.account_number}</p>
                      </div>
                    )}
                  </div>
                )}
                {qrCodeUrl && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <QrCode className="h-3.5 w-3.5" />
                      Scan to transfer
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Bank transfer QR code"
                      className="w-36 rounded-lg border border-border object-contain"
                    />
                  </div>
                )}
              </div>
            ) : null
          )}

          {paymentInfo.details && (
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {paymentInfo.details}
            </p>
          )}

          {paymentInfo.method !== 'Bank Transfer' && !paymentInfo.details && (
            <p className="text-sm text-muted-foreground">
              Please contact us for payment details.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Screenshot upload */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Upload Payment Screenshot</h3>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {!file ? (
          <div
            className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">Max 5 MB • Image files only</p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg border border-border">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Deposit screenshot" className="w-full object-contain max-h-[400px]" />
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="border-t border-border bg-muted/50 px-3 py-2">
              <p className="truncate text-xs text-muted-foreground">{file.name}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={!file || submitting}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Submit Deposit Screenshot
          </>
        )}
      </Button>
    </form>
  )
}

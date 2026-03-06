'use client'

import { useState, useTransition, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, Loader2, CheckCircle2, ImagePlus, X, QrCode } from 'lucide-react'
import { updateSetting, uploadQrCode } from '@/app/admin/settings/actions'
import type { PaymentInfo } from '@/lib/types'

interface DepositSettingsProps {
  initialAmount: number // cents
  initialPaymentInfo: PaymentInfo
  initialQrCodeUrl?: string
}

export function DepositSettings({ initialAmount, initialPaymentInfo, initialQrCodeUrl }: DepositSettingsProps) {
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState(String((initialAmount / 100).toFixed(2)))
  const [method, setMethod] = useState(initialPaymentInfo.method)
  const [details, setDetails] = useState(initialPaymentInfo.details)
  const [bankName, setBankName] = useState(initialPaymentInfo.bank_name ?? '')
  const [accountHolder, setAccountHolder] = useState(initialPaymentInfo.account_holder ?? '')
  const [accountNumber, setAccountNumber] = useState(initialPaymentInfo.account_number ?? '')
  const [transitNumber, setTransitNumber] = useState(initialPaymentInfo.transit_number ?? '')
  const [institutionNumber, setInstitutionNumber] = useState(initialPaymentInfo.institution_number ?? '')
  const [qrCodePath, setQrCodePath] = useState(initialPaymentInfo.qr_code_path ?? '')
  const [qrCodePreview, setQrCodePreview] = useState<string | undefined>(initialQrCodeUrl)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const qrInputRef = useRef<HTMLInputElement>(null)

  const isBankTransfer = method === 'Bank Transfer'

  function handleQrFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('QR code image must be under 2 MB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    setQrCodeFile(file)
    setSuccess(false)
    const reader = new FileReader()
    reader.onload = (ev) => setQrCodePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function removeQrCode() {
    setQrCodeFile(null)
    setQrCodePreview(undefined)
    setQrCodePath('')
    setSuccess(false)
  }

  function handleSave() {
    setError(null)
    setSuccess(false)

    const cents = Math.round(parseFloat(amount) * 100)
    if (isNaN(cents) || cents < 0) {
      setError('Please enter a valid deposit amount.')
      return
    }

    startTransition(async () => {
      const amountResult = await updateSetting('deposit_amount', { cents })
      if (amountResult.error) {
        setError(amountResult.error)
        return
      }

      let currentQrPath = qrCodePath

      if (qrCodeFile) {
        const fd = new FormData()
        fd.set('qrCode', qrCodeFile)
        const qrResult = await uploadQrCode(fd)
        if (qrResult.error) {
          setError(qrResult.error)
          return
        }
        currentQrPath = qrResult.path!
        setQrCodePath(currentQrPath)
        setQrCodeFile(null)
      }

      const paymentInfo: PaymentInfo = {
        method: method.trim(),
        details: details.trim(),
      }

      if (isBankTransfer) {
        if (bankName.trim()) paymentInfo.bank_name = bankName.trim()
        if (accountHolder.trim()) paymentInfo.account_holder = accountHolder.trim()
        if (accountNumber.trim()) paymentInfo.account_number = accountNumber.trim()
        if (transitNumber.trim()) paymentInfo.transit_number = transitNumber.trim()
        if (institutionNumber.trim()) paymentInfo.institution_number = institutionNumber.trim()
        if (currentQrPath) paymentInfo.qr_code_path = currentQrPath
      }

      const infoResult = await updateSetting('deposit_payment_info', paymentInfo)
      if (infoResult.error) {
        setError(infoResult.error)
        return
      }

      setSuccess(true)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5" />
          Deposit Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deposit-amount">Deposit Amount ($)</Label>
          <Input
            id="deposit-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setSuccess(false) }}
          />
          <p className="text-xs text-muted-foreground">
            This amount will be shown to customers during booking.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method Name</Label>
          <Input
            id="payment-method"
            placeholder="e.g., Bank Transfer, e-Transfer"
            value={method}
            onChange={(e) => { setMethod(e.target.value); setSuccess(false) }}
          />
        </div>

        {isBankTransfer && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  placeholder="e.g., RBC, TD Bank"
                  value={bankName}
                  onChange={(e) => { setBankName(e.target.value); setSuccess(false) }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-holder">Account Holder Name</Label>
                <Input
                  id="account-holder"
                  placeholder="Name on account"
                  value={accountHolder}
                  onChange={(e) => { setAccountHolder(e.target.value); setSuccess(false) }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="transit-number">Transit No.</Label>
                <Input
                  id="transit-number"
                  placeholder="e.g., 00123"
                  value={transitNumber}
                  onChange={(e) => { setTransitNumber(e.target.value); setSuccess(false) }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution-number">Institution No.</Label>
                <Input
                  id="institution-number"
                  placeholder="e.g., 003"
                  value={institutionNumber}
                  onChange={(e) => { setInstitutionNumber(e.target.value); setSuccess(false) }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account No.</Label>
                <Input
                  id="account-number"
                  placeholder="Account number"
                  value={accountNumber}
                  onChange={(e) => { setAccountNumber(e.target.value); setSuccess(false) }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5" />
                Transfer QR Code
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleQrFileChange}
              />
              {qrCodePreview ? (
                <div className="relative w-36 overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodePreview} alt="QR code preview" className="w-full object-contain" />
                  <button
                    type="button"
                    onClick={removeQrCode}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
                    aria-label="Remove QR code"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex w-36 cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  onClick={() => qrInputRef.current?.click()}
                >
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <p className="text-center text-xs text-muted-foreground">Upload QR</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Customers will see this QR code on the deposit payment page.
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="payment-details">
            {isBankTransfer ? 'Additional Notes' : 'Payment Details'}
          </Label>
          <Textarea
            id="payment-details"
            placeholder={
              isBankTransfer
                ? 'Optional additional instructions for customers…'
                : 'Enter the payment instructions shown to customers…'
            }
            rows={isBankTransfer ? 3 : 5}
            value={details}
            onChange={(e) => { setDetails(e.target.value); setSuccess(false) }}
          />
          <p className="text-xs text-muted-foreground">
            {isBankTransfer
              ? 'Optional notes displayed below the bank account details.'
              : 'This will be shown to customers on the deposit payment page.'}
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully.
          </p>
        )}

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}

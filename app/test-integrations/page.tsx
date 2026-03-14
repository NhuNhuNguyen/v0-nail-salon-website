'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function TestIntegrations() {
  const [emailLoading, setEmailLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [emailResult, setEmailResult] = useState<any>(null)
  const [smsResult, setSmsResult] = useState<any>(null)

  const testEmail = async () => {
    setEmailLoading(true)
    setEmailResult(null)
    try {
      const res = await fetch('/api/test-email', { method: 'POST' })
      const data = await res.json()
      setEmailResult(data)
    } catch (error) {
      setEmailResult({ success: false, error: String(error) })
    } finally {
      setEmailLoading(false)
    }
  }

  const testSms = async () => {
    setSmsLoading(true)
    setSmsResult(null)
    try {
      const res = await fetch('/api/test-sms', { method: 'POST' })
      const data = await res.json()
      setSmsResult(data)
    } catch (error) {
      setSmsResult({ success: false, error: String(error) })
    } finally {
      setSmsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Integration Test Center</h1>

        <div className="grid gap-6">
          {/* Email Test Card */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                📧 Email (Gmail SMTP)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Tests if booking confirmation emails will be sent to admin.
              </p>
              <Button
                onClick={testEmail}
                disabled={emailLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {emailLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Email'
                )}
              </Button>

              {emailResult && (
                <div
                  className={`rounded-lg p-4 ${
                    emailResult.success
                      ? 'border border-emerald-500 bg-emerald-950/20'
                      : 'border border-red-500 bg-red-950/20'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {emailResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={emailResult.success ? 'text-emerald-400' : 'text-red-400'}>
                      {emailResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>

                  {emailResult.success ? (
                    <div className="space-y-1 text-sm text-slate-200">
                      <p>✅ {emailResult.message}</p>
                      <p className="text-xs text-slate-400">
                        Message ID: {emailResult.messageId}
                      </p>
                      <p className="text-xs text-slate-400">To: {emailResult.to}</p>
                      <p className="mt-2 text-yellow-400">{emailResult.info}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm text-slate-200">
                      <p>❌ {emailResult.error}</p>
                      {emailResult.required && (
                        <div className="mt-2 space-y-1">
                          <p className="font-semibold">Required in .env.local:</p>
                          {emailResult.required.map((req: string) => (
                            <p key={req} className="text-yellow-400">
                              - {req}
                            </p>
                          ))}
                        </div>
                      )}
                      {emailResult.troubleshooting && (
                        <div className="mt-2 space-y-1">
                          <p className="font-semibold">Troubleshooting:</p>
                          {emailResult.troubleshooting.map((tip: string, i: number) => (
                            <p key={i} className="text-slate-300">
                              {i + 1}. {tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Test Card */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                💬 SMS (Twilio)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Tests if booking confirmation SMS messages will be sent to customers.
                <br />
                <span className="text-xs text-slate-400">Optional: Skip if not using SMS</span>
              </p>
              <Button
                onClick={testSms}
                disabled={smsLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {smsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test SMS'
                )}
              </Button>

              {smsResult && (
                <div
                  className={`rounded-lg p-4 ${
                    smsResult.success
                      ? 'border border-emerald-500 bg-emerald-950/20'
                      : 'border border-red-500 bg-red-950/20'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {smsResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={smsResult.success ? 'text-emerald-400' : 'text-red-400'}>
                      {smsResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>

                  {smsResult.success ? (
                    <div className="space-y-1 text-sm text-slate-200">
                      <p>✅ {smsResult.message}</p>
                      <p className="text-xs text-slate-400">SID: {smsResult.sid}</p>
                      <p className="text-xs text-slate-400">From: {smsResult.from}</p>
                      <p className="text-xs text-slate-400">To: {smsResult.to}</p>
                      <p className="text-xs text-slate-400">Status: {smsResult.status}</p>
                      <p className="mt-2 text-yellow-400">{smsResult.info}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm text-slate-200">
                      <p>❌ {smsResult.error}</p>
                      {smsResult.required && (
                        <div className="mt-2 space-y-1">
                          <p className="font-semibold">Required in .env.local:</p>
                          {smsResult.required.map((req: string) => (
                            <p key={req} className="text-yellow-400">
                              - {req}
                            </p>
                          ))}
                        </div>
                      )}
                      {smsResult.info && (
                        <p className="mt-2 text-slate-300">{smsResult.info}</p>
                      )}
                      {smsResult.troubleshooting && (
                        <div className="mt-2 space-y-1">
                          <p className="font-semibold">Troubleshooting:</p>
                          {smsResult.troubleshooting.map((tip: string, i: number) => (
                            <p key={i} className="text-slate-300">
                              {i + 1}. {tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">✅ Setup Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-slate-300">
                After testing, you can:
              </p>
              <ul className="space-y-1 text-slate-400">
                <li>• Test bookings: Go to <code className="text-yellow-400">/booking</code></li>
                <li>• View admin dashboard: Go to <code className="text-yellow-400">/admin</code></li>
                <li>• Confirm bookings to trigger SMS/email</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

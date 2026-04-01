import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listAdmins, getSettings, getQrCodeUrl } from './actions'
import { AdminUsers } from '@/components/admin/admin-users'
import { ChangePassword } from '@/components/admin/change-password'
import { DepositSettings } from '@/components/admin/deposit-settings'
import type { PaymentInfo } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Settings | MK Admin',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const [adminsResult, settingsResult] = await Promise.all([
    listAdmins(),
    getSettings(),
  ])

  const depositAmount = settingsResult.settings?.deposit_amount?.cents ?? 2000
  const paymentInfo: PaymentInfo = settingsResult.settings?.deposit_payment_info ?? {
    method: 'Bank Transfer',
    details: '',
  }

  let qrCodeUrl: string | undefined
  if (paymentInfo.qr_code_path) {
    const qrResult = await getQrCodeUrl(paymentInfo.qr_code_path)
    qrCodeUrl = qrResult.url
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage admin accounts, change your password, and configure deposit settings.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <AdminUsers
            initialUsers={adminsResult.users}
            currentUserId={user.id}
          />
          <ChangePassword />
        </div>
        <div>
          <DepositSettings
            initialAmount={depositAmount}
            initialPaymentInfo={paymentInfo}
            initialQrCodeUrl={qrCodeUrl}
          />
        </div>
      </div>
    </div>
  )
}

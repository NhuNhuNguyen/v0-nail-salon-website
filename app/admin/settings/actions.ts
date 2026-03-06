'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Admin User Management ───

export async function listAdmins(): Promise<{
  users: { id: string; email: string; created_at: string }[]
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { users: [], error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()

  if (error) return { users: [], error: error.message }

  return {
    users: (data.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? '',
      created_at: u.created_at,
    })),
  }
}

export async function createAdmin(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  if (!email || !password) return { error: 'Email and password are required.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return { error: error.message }

  return {}
}

export async function deleteAdmin(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }
  if (user.id === userId) return { error: 'You cannot delete your own account.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  return {}
}

// ─── Password Management ───

export async function changePassword(
  newPassword: string,
): Promise<{ error?: string }> {
  if (!newPassword) return { error: 'New password is required.' }
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters.' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { error: error.message }

  return {}
}

// ─── App Settings ───

export async function getSettings(): Promise<{
  settings: Record<string, any>
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')

  if (error) return { settings: {}, error: error.message }

  const settings: Record<string, any> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }
  return { settings }
}

export async function updateSetting(
  key: string,
  value: any,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) return { error: error.message }

  return {}
}

// ─── QR Code Management ───

export async function uploadQrCode(
  formData: FormData,
): Promise<{ path?: string; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const image = formData.get('qrCode') as File
  if (!image || image.size === 0) return { error: 'No file provided.' }
  if (image.size > 2 * 1024 * 1024) return { error: 'QR code image must be under 2 MB.' }
  if (!image.type.startsWith('image/')) return { error: 'Only image files are allowed.' }

  const admin = createAdminClient()
  const ext = image.name.split('.').pop()?.toLowerCase() || 'png'
  const storagePath = `settings/bank-transfer-qr.${ext}`
  const buffer = Buffer.from(await image.arrayBuffer())

  const { error: uploadErr } = await admin.storage
    .from('booking-images')
    .upload(storagePath, buffer, { contentType: image.type, upsert: true })

  if (uploadErr) return { error: 'Failed to upload QR code.' }

  return { path: storagePath }
}

export async function getQrCodeUrl(
  path: string,
): Promise<{ url?: string; error?: string }> {
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('booking-images')
    .createSignedUrl(path, 60 * 60 * 24) // 24-hour signed URL

  if (error || !data?.signedUrl) return { error: 'Failed to get QR code URL.' }

  return { url: data.signedUrl }
}

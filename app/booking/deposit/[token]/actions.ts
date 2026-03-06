'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function uploadDepositScreenshot(formData: FormData) {
  const token = formData.get('token') as string
  const bookingId = formData.get('bookingId') as string
  const image = formData.get('depositImage') as File

  if (!token || !bookingId) return { error: 'Missing booking information.' }
  if (!image || image.size === 0) return { error: 'Please upload a payment screenshot.' }
  if (image.size > MAX_FILE_SIZE) return { error: 'Image must be under 5 MB.' }
  if (!image.type.startsWith('image/')) return { error: 'Only image files are allowed.' }

  const supabase = await createClient()

  // Verify booking exists and deposit not already uploaded
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, confirmation_token, deposit_image_path')
    .eq('id', bookingId)
    .eq('confirmation_token', token)
    .single()

  if (fetchErr || !booking) return { error: 'Booking not found.' }
  if (booking.deposit_image_path) return { error: 'Deposit screenshot already uploaded.' }

  // Upload to storage
  const admin = createAdminClient()
  const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `deposits/${bookingId}/${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await image.arrayBuffer())

  const { error: uploadErr } = await admin.storage
    .from('booking-images')
    .upload(storagePath, buffer, { contentType: image.type })

  if (uploadErr) return { error: 'Failed to upload image. Please try again.' }

  // Update booking with deposit info
  const { error: updateErr } = await supabase
    .from('bookings')
    .update({
      deposit_image_path: storagePath,
      deposit_uploaded_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateErr) return { error: 'Failed to save deposit info. Please try again.' }

  // Broadcast deposit-uploaded event for admin real-time updates
  const channel = supabase.channel('admin-bookings')
  await channel.send({
    type: 'broadcast',
    event: 'deposit-uploaded',
    payload: { bookingId },
  })
  supabase.removeChannel(channel)

  redirect(`/booking/confirm/${token}`)
}

export async function cancelBooking(
  bookingId: string,
  token: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, deposit_image_path')
    .eq('id', bookingId)
    .eq('confirmation_token', token)
    .single()

  if (fetchErr || !booking) return { error: 'Booking not found.' }
  if (booking.deposit_image_path) return { error: 'Deposit already submitted.' }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) return { error: error.message }

  return {}
}

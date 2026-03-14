'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatET } from '@/lib/timezone'

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function createBooking(formData: FormData) {
  const customerName = (formData.get('customerName') as string)?.trim() ?? ''
  const phone = (formData.get('phone') as string)?.trim() ?? ''
  const bookingTime = formData.get('bookingTime') as string
  const serviceIdsRaw = formData.get('serviceIds') as string
  const staffId = (formData.get('staffId') as string) || null
  const images = formData.getAll('images') as File[]

  // Basic server-side validation
  if (!customerName) return { error: 'Name is required.' }
  if (!phone) return { error: 'Phone number is required.' }
  if (!bookingTime) return { error: 'Please select a date and time.' }

  let serviceIds: string[]
  try {
    serviceIds = JSON.parse(serviceIdsRaw)
  } catch {
    return { error: 'Invalid service selection.' }
  }
  if (!serviceIds.length) return { error: 'Select at least one service.' }

  // Validate images
  const validImages = images.filter((f) => f.size > 0)
  if (validImages.length > MAX_IMAGES) {
    return { error: `You can upload up to ${MAX_IMAGES} images.` }
  }
  for (const img of validImages) {
    if (img.size > MAX_FILE_SIZE) {
      return { error: `Each image must be under 5 MB.` }
    }
    if (!img.type.startsWith('image/')) {
      return { error: 'Only image files are allowed.' }
    }
  }

  const supabase = await createClient()

  // 1. Look up selected services to snapshot prices
  const { data: services, error: svcErr } = await supabase
    .from('services')
    .select('id, name, price_min')
    .in('id', serviceIds)
    .eq('active', true)

  if (svcErr || !services?.length) {
    return { error: 'Could not load selected services. Please try again.' }
  }

  // 2. Calculate estimated total
  const estimatedTotal = services.reduce((sum, s) => sum + s.price_min, 0)

  // Note: No deposit required in this flow - customers book without deposit
  // Admin will call to confirm the appointment

  // 3. Upsert customer by phone
  const { data: existingCustomers } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', phone)
    .limit(1)

  let customerId: string

  if (existingCustomers && existingCustomers.length > 0) {
    customerId = existingCustomers[0].id
    // Update name in case it changed
    await supabase
      .from('customers')
      .update({ name: customerName })
      .eq('id', customerId)
  } else {
    const { data: newCustomer, error: custErr } = await supabase
      .from('customers')
      .insert({ name: customerName, phone })
      .select('id')
      .single()

    if (custErr || !newCustomer) {
      return { error: 'Could not save customer info. Please try again.' }
    }
    customerId = newCustomer.id
  }

  // 4. Generate URL-safe confirmation token
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12)

  // 5. Insert booking
  const { data: booking, error: bookErr } = await supabase
    .from('bookings')
    .insert({
      customer_id: customerId,
      staff_id: staffId,
      confirmation_token: token,
      status: 'pending',
      estimated_total: estimatedTotal,
      deposit_amount: null,
      booking_time: bookingTime,
    })
    .select('id')
    .single()

  if (bookErr || !booking) {
    return { error: 'Could not create booking. Please try again.' }
  }

  // 6. Insert booking_services junction rows
  const junctionRows = services.map((s) => ({
    booking_id: booking.id,
    service_id: s.id,
    price_at_booking: s.price_min,
  }))

  const { error: junctionErr } = await supabase
    .from('booking_services')
    .insert(junctionRows)

  if (junctionErr) {
    return { error: 'Could not save service selections. Please try again.' }
  }

  // 7. Upload reference images to Storage (service role bypasses RLS)
  const uploadedPaths: string[] = []
  if (validImages.length > 0) {
    const admin = createAdminClient()
    for (const img of validImages) {
      const ext = img.name.split('.').pop()?.toLowerCase() || 'jpg'
      const storagePath = `bookings/${booking.id}/${crypto.randomUUID()}.${ext}`
      const buffer = Buffer.from(await img.arrayBuffer())
      const { error: uploadErr } = await admin.storage
        .from('booking-images')
        .upload(storagePath, buffer, { contentType: img.type })
      if (uploadErr) {
        console.error(`Image upload failed for ${img.name}:`, uploadErr.message)
      } else {
        uploadedPaths.push(storagePath)
      }
    }

    // Update booking with image paths if any were uploaded
    if (uploadedPaths.length > 0) {
      await supabase
        .from('bookings')
        .update({ sample_image_paths: uploadedPaths })
        .eq('id', booking.id)
    }
  }

  // 8. Send email notification to staff (optional - only if configured)
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && process.env.STAFF_EMAIL) {
    const bookingTimeFormatted = formatET(bookingTime, 'EEEE, MMMM d, yyyy h:mm a')
    const adminLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8b4789; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: 600; color: #555; margin-top: 12px; }
            .value { color: #333; margin-top: 4px; }
            .button { display: inline-block; background-color: #8b4789; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📞 New Booking Received</h1>
            </div>
            <div class="content">
              <p>A new booking request has been submitted. Please review and call the customer to confirm the appointment.</p>
              
              <div class="section">
                <div class="label">👤 Customer Name</div>
                <div class="value">${customerName}</div>
              </div>
              
              <div class="section">
                <div class="label">📱 Phone Number</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              
              <div class="section">
                <div class="label">📅 Requested Date & Time</div>
                <div class="value">${bookingTimeFormatted}</div>
              </div>
              
              <div class="section">
                <div class="label">💅 Services</div>
                <div class="value">${services.map((s) => s.name).join(', ')}</div>
              </div>
              
              <div class="section">
                <div class="label">💰 Estimated Total</div>
                <div class="value">$${(estimatedTotal / 100).toFixed(2)}+</div>
              </div>
              
              <div class="section">
                <div class="label">📋 Booking ID</div>
                <div class="value" style="font-family: monospace;">${booking.id.slice(0, 8).toUpperCase()}</div>
              </div>
              
              <a href="${adminLink}" class="button">View in Admin Dashboard →</a>
              
              <div class="footer">
                <p>⏰ Please call the customer ASAP to confirm this booking. No action is needed from the customer.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send via SendGrid
    fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: process.env.STAFF_EMAIL }],
            subject: `📞 New Booking – ${customerName}`,
          },
        ],
        from: { email: process.env.SENDGRID_FROM_EMAIL },
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    }).catch(console.error)
  }

  // 9. Broadcast new-booking event for admin real-time updates
  const channel = supabase.channel('admin-bookings')
  await channel.send({
    type: 'broadcast',
    event: 'new-booking',
    payload: { bookingId: booking.id },
  })
  supabase.removeChannel(channel)

  return { confirmationToken: token }
}

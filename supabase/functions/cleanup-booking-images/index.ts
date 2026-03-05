import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let expiredCleaned = 0
    let orphanedCleaned = 0

    // 1. Clean expired booking images (booking_time > 2 days ago)
    const { data: expiredBookings, error: fetchErr } = await supabase
      .from('bookings')
      .select('id, sample_image_paths')
      .lt('booking_time', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
      .neq('sample_image_paths', '{}')

    if (fetchErr) {
      throw new Error(`Failed to fetch expired bookings: ${fetchErr.message}`)
    }

    for (const booking of expiredBookings ?? []) {
      const paths: string[] = booking.sample_image_paths ?? []
      if (paths.length === 0) continue

      const { error: removeErr } = await supabase.storage
        .from('booking-images')
        .remove(paths)

      if (removeErr) {
        console.error(`Failed to remove files for booking ${booking.id}:`, removeErr.message)
        continue
      }

      await supabase
        .from('bookings')
        .update({ sample_image_paths: [] })
        .eq('id', booking.id)

      expiredCleaned++
    }

    // 2. Clean orphaned files (booking ID folder doesn't match any booking)
    const { data: folders } = await supabase.storage
      .from('booking-images')
      .list('bookings', { limit: 1000 })

    for (const folder of folders ?? []) {
      // Each folder name is a booking UUID
      const bookingId = folder.name
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('id', bookingId)

      if (count === 0) {
        // List files inside the orphan folder and remove them
        const { data: orphanFiles } = await supabase.storage
          .from('booking-images')
          .list(`bookings/${bookingId}`, { limit: 100 })

        if (orphanFiles && orphanFiles.length > 0) {
          const orphanPaths = orphanFiles.map((f) => `bookings/${bookingId}/${f.name}`)
          await supabase.storage.from('booking-images').remove(orphanPaths)
          orphanedCleaned++
        }
      }
    }

    return new Response(
      JSON.stringify({ expired_cleaned: expiredCleaned, orphaned_cleaned: orphanedCleaned }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('Cleanup error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

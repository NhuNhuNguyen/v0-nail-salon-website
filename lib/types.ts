// ─── Database row types ───

export interface Service {
  id: string
  category: string
  name: string
  price_display: string
  price_min: number // cents
  duration_minutes: number | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  created_at: string
}

export interface Staff {
  id: string
  name: string
  active: boolean
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  staff_id: string | null
  confirmation_token: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  estimated_total: number // cents
  deposit_amount: number | null // cents — future Stripe use
  notes: string | null
  sample_image_paths: string[]
  booking_time: string // ISO datetime — customer's expected arrival
  created_at: string
}

export interface BookingService {
  id: string
  booking_id: string
  service_id: string
  price_at_booking: number // cents
}

// ─── Joined / composite types ───

export interface BookingServiceWithDetails extends BookingService {
  service: Pick<Service, 'name' | 'category' | 'price_display'>
}

export interface BookingWithDetails extends Booking {
  customer: Pick<Customer, 'name' | 'phone'>
  staff: Pick<Staff, 'id' | 'name'> | null
  booking_services: BookingServiceWithDetails[]
}

// ─── Form types ───

export interface BookingFormData {
  customerName: string
  phone: string
  serviceIds: string[]
  staffId: string | null
  bookingTime: string // ISO datetime string
}

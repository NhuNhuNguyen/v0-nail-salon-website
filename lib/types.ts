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
  deposit_amount: number | null // cents
  deposit_image_path: string | null
  deposit_uploaded_at: string | null
  notes: string | null
  sample_image_paths: string[]
  booking_time: string // ISO datetime — customer's expected arrival
  reminder_email_sent_at: string | null // timestamp of last reminder email
  created_at: string
}

export interface BookingService {
  id: string
  booking_id: string
  service_id: string
  price_at_booking: number // cents
}

export interface CallLog {
  id: string
  booking_id: string
  admin_notes: string | null
  called_at: string // ISO datetime
  created_at: string
}

export interface Review {
  id: string
  name: string
  rating: number
  text: string
  service: string
  date_of_service: string | null
  staff_id: string | null
  status: 'pending' | 'published' | 'archived'
  created_at: string
  staff?: Pick<Staff, 'id' | 'name'> | null
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

// ─── Settings types ───

export interface AppSetting {
  key: string
  value: any
  updated_at: string
}

export interface PaymentInfo {
  method: string
  details: string
  // Bank Transfer specific fields
  bank_name?: string
  account_holder?: string
  account_number?: string
  transit_number?: string
  institution_number?: string
  qr_code_path?: string
}

export interface PaginatedBookings {
  data: BookingWithDetails[]
  totalCount: number
}

// ─── Form types ───

export interface BookingFormData {
  customerName: string
  phone: string
  serviceIds: string[]
  staffId: string | null
  bookingTime: string // ISO datetime string
}

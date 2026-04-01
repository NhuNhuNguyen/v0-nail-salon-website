import { redirect } from 'next/navigation'

// This page is only for development and should not be accessible in production
export default function TestIntegrations() {
  redirect('/')
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client with fallback for missing env vars (handled by EnvironmentCheck component)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface Business {
  id: string
  name: string
  description?: string
  category: 'Food & Beverage' | 'Retail' | 'Health & Wellness' | 'Entertainment & Recreation' | 'Personal Services'
  address: string
  city: string
  state: string
  zip_code: string
  latitude: number
  longitude: number
  phone?: string
  email: string
  contact_name: string
  logo_url?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  business_id: string
  title: string
  description: string
  discount_amount: string
  terms?: string
  usage_limit_type: 'once' | 'daily' | 'monthly_1' | 'monthly_2' | 'monthly_4'
  start_date: string
  end_date: string
  active: boolean
  created_at: string
  updated_at: string
  business?: Business
}

export interface Profile {
  id: string
  full_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  latitude?: number
  longitude?: number
  subscription_status: 'active' | 'inactive'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_plan?: 'monthly' | 'yearly'
  subscription_period_start?: string
  subscription_period_end?: string
  created_at: string
  updated_at: string
}
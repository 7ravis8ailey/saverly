import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database type definitions based on our optimized schema
export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  latitude?: number
  longitude?: number
  subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  subscription_plan?: 'monthly' | 'yearly'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_started_at?: string
  subscription_expires_at?: string
  push_notifications_enabled: boolean
  location_sharing_enabled: boolean
  marketing_emails_enabled: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface Business {
  id: string
  name: string
  description?: string
  category: 'restaurant' | 'retail' | 'service' | 'entertainment' | 'health' | 'beauty' | 'automotive' | 'other'
  email: string
  phone?: string
  website?: string
  contact_name: string
  street_address: string
  city: string
  state: string
  zip_code: string
  latitude: number
  longitude: number
  logo_url?: string
  banner_url?: string
  is_active: boolean
  is_verified: boolean
  accepts_reservations: boolean
  operating_hours: Record<string, any>
  total_coupons: number
  total_redemptions: number
  average_rating: number
  created_at: string
  updated_at: string
  verified_at?: string
}

export interface Coupon {
  id: string
  business_id: string
  business?: Business
  title: string
  description: string
  terms_conditions?: string
  discount_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_item'
  discount_value: number
  minimum_purchase: number
  maximum_discount?: number
  usage_limit_type: 'once' | 'daily' | 'weekly' | 'monthly' | 'unlimited'
  max_uses_per_user: number
  max_total_uses?: number
  current_uses: number
  valid_from: string
  valid_until: string
  is_active: boolean
  is_featured: boolean
  requires_subscription: boolean
  tags: string[]
  priority: number
  view_count: number
  redemption_count: number
  created_at: string
  updated_at: string
}

export interface Redemption {
  id: string
  user_id: string
  coupon_id: string
  business_id: string
  business?: Business
  coupon?: Coupon
  qr_code: string
  display_code: string
  verification_code?: string
  status: 'pending' | 'redeemed' | 'expired' | 'canceled'
  generated_at: string
  expires_at: string
  redeemed_at?: string
  redemption_latitude?: number
  redemption_longitude?: number
  discount_amount?: number
  original_value?: number
  user_agent?: string
  ip_address?: string
  device_info: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  business_id: string
  business?: Business
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id?: string
  event_type: 'coupon_view' | 'coupon_redeem' | 'business_view' | 'search' | 'subscription_start' | 'subscription_cancel' | 'app_open' | 'app_close'
  event_data: Record<string, any>
  session_id?: string
  user_agent?: string
  ip_address?: string
  created_at: string
}

export function useSupabase() {
  return { supabase }
}
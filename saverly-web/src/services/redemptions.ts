import { supabase, type Redemption } from '../hooks/useSupabase'

export interface CreateRedemptionData {
  coupon_id: string
  user_id: string
  user_location?: { latitude: number; longitude: number }
}

// Generate a unique QR code
function generateQRCode(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `SAV-${timestamp}-${random}`.toUpperCase()
}

// Generate a user-friendly display code
function generateDisplayCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a verification code for additional security
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createRedemption(data: CreateRedemptionData): Promise<Redemption | null> {
  try {
    // First, check if the coupon is still valid and available
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', data.coupon_id)
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .gte('valid_until', new Date().toISOString())
      .single()

    if (couponError || !coupon) {
      console.error('Coupon not found or invalid:', couponError)
      return null
    }

    // Check usage limits
    if (coupon.max_total_uses && coupon.current_uses >= coupon.max_total_uses) {
      throw new Error('Coupon usage limit reached')
    }

    // Check user-specific usage limits
    const { data: userRedemptions } = await supabase
      .from('redemptions')
      .select('id')
      .eq('user_id', data.user_id)
      .eq('coupon_id', data.coupon_id)
      .eq('status', 'redeemed')

    if (userRedemptions && userRedemptions.length >= coupon.max_uses_per_user) {
      throw new Error('User has reached maximum uses for this coupon')
    }

    // Create the redemption
    const redemptionData = {
      user_id: data.user_id,
      coupon_id: data.coupon_id,
      business_id: coupon.business_id,
      qr_code: generateQRCode(),
      display_code: generateDisplayCode(),
      verification_code: generateVerificationCode(),
      expires_at: new Date(Date.now() + 60000).toISOString(), // 60 seconds
      ...(data.user_location && {
        redemption_latitude: data.user_location.latitude,
        redemption_longitude: data.user_location.longitude,
      }),
    }

    const { data: redemption, error } = await supabase
      .from('redemptions')
      .insert(redemptionData)
      .select(`
        *,
        business:businesses(*),
        coupon:coupons(*)
      `)
      .single()

    if (error) {
      console.error('Error creating redemption:', error)
      return null
    }

    // Track analytics event
    await trackAnalyticsEvent({
      user_id: data.user_id,
      event_type: 'coupon_redeem',
      event_data: {
        coupon_id: data.coupon_id,
        business_id: coupon.business_id,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    })

    return redemption as Redemption
  } catch (error) {
    console.error('Error in createRedemption:', error)
    return null
  }
}

export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  try {
    const { data, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        business:businesses(*),
        coupon:coupons(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user redemptions:', error)
      return []
    }

    return (data as Redemption[]) || []
  } catch (error) {
    console.error('Error in getUserRedemptions:', error)
    return []
  }
}

export async function getRedemptionByQRCode(qrCode: string): Promise<Redemption | null> {
  try {
    const { data, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        business:businesses(*),
        coupon:coupons(*)
      `)
      .eq('qr_code', qrCode)
      .single()

    if (error || !data) {
      console.error('Error fetching redemption by QR code:', error)
      return null
    }

    return data as Redemption
  } catch (error) {
    console.error('Error in getRedemptionByQRCode:', error)
    return null
  }
}

export async function markRedemptionAsUsed(
  qrCode: string,
  location?: { latitude: number; longitude: number }
): Promise<boolean> {
  try {
    const updateData: any = {
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
    }

    if (location) {
      updateData.redemption_latitude = location.latitude
      updateData.redemption_longitude = location.longitude
    }

    const { error } = await supabase
      .from('redemptions')
      .update(updateData)
      .eq('qr_code', qrCode)
      .eq('status', 'pending')

    if (error) {
      console.error('Error marking redemption as used:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in markRedemptionAsUsed:', error)
    return false
  }
}

export async function expireOldRedemptions(): Promise<void> {
  try {
    await supabase
      .from('redemptions')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())
  } catch (error) {
    console.error('Error expiring old redemptions:', error)
  }
}

export async function getRedemptionStats(businessId?: string) {
  try {
    let query = supabase
      .from('redemptions')
      .select('status, created_at, discount_amount')

    if (businessId) {
      query = query.eq('business_id', businessId)
    }

    const { data, error } = await query

    if (error || !data) {
      console.error('Error fetching redemption stats:', error)
      return {
        total: 0,
        redeemed: 0,
        pending: 0,
        expired: 0,
        total_value: 0,
      }
    }

    const stats = data.reduce(
      (acc, redemption) => {
        acc.total++
        if (redemption.status === 'redeemed') acc.redeemed++
        else if (redemption.status === 'pending') acc.pending++
        else if (redemption.status === 'expired') acc.expired++
        
        if (redemption.discount_amount) {
          acc.total_value += redemption.discount_amount
        }
        
        return acc
      },
      { total: 0, redeemed: 0, pending: 0, expired: 0, total_value: 0 }
    )

    return stats
  } catch (error) {
    console.error('Error in getRedemptionStats:', error)
    return {
      total: 0,
      redeemed: 0,
      pending: 0,
      expired: 0,
      total_value: 0,
    }
  }
}

// Analytics tracking helper
async function trackAnalyticsEvent(event: {
  user_id: string
  event_type: string
  event_data: Record<string, any>
}): Promise<void> {
  try {
    await supabase.from('analytics_events').insert({
      user_id: event.user_id,
      event_type: event.event_type,
      event_data: event.event_data,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
    })
  } catch (error) {
    console.error('Error tracking analytics event:', error)
  }
}

// Simple session ID generation
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('saverly_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('saverly_session_id', sessionId)
  }
  return sessionId
}
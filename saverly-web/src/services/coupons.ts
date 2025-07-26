import { supabase, type Coupon, type Business } from '../hooks/useSupabase'

export interface CouponWithBusiness extends Coupon {
  business: Business
  distance?: number
}

export interface CouponFilters {
  category?: string
  business_id?: string
  max_distance?: number
  user_location?: { latitude: number; longitude: number }
  subscription_required?: boolean
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function getCoupons(filters: CouponFilters = {}): Promise<CouponWithBusiness[]> {
  try {
    let query = supabase
      .from('coupons')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .gte('valid_until', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    // Filter by business category
    if (filters.category) {
      query = query.eq('business.category', filters.category)
    }

    // Filter by specific business
    if (filters.business_id) {
      query = query.eq('business_id', filters.business_id)
    }

    // Filter by subscription requirement
    if (filters.subscription_required !== undefined) {
      query = query.eq('requires_subscription', filters.subscription_required)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching coupons:', error)
      return []
    }

    if (!data) return []

    // Add distance calculation if user location is provided
    const couponsWithDistance: CouponWithBusiness[] = data.map((coupon) => {
      const couponWithBusiness = coupon as CouponWithBusiness
      
      if (filters.user_location && coupon.business) {
        couponWithBusiness.distance = calculateDistance(
          filters.user_location.latitude,
          filters.user_location.longitude,
          coupon.business.latitude,
          coupon.business.longitude
        )
      }

      return couponWithBusiness
    })

    // Filter by distance if specified
    let filteredCoupons = couponsWithDistance
    if (filters.max_distance && filters.user_location) {
      filteredCoupons = couponsWithDistance.filter(
        (coupon) => coupon.distance !== undefined && coupon.distance <= filters.max_distance!
      )
    }

    // Sort by distance if user location is provided
    if (filters.user_location) {
      filteredCoupons.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return filteredCoupons
  } catch (error) {
    console.error('Error in getCoupons:', error)
    return []
  }
}

export async function getCouponById(id: string): Promise<CouponWithBusiness | null> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching coupon:', error)
      return null
    }

    return data as CouponWithBusiness
  } catch (error) {
    console.error('Error in getCouponById:', error)
    return null
  }
}

export async function incrementCouponViews(couponId: string): Promise<void> {
  try {
    await supabase
      .from('coupons')
      .update({ view_count: supabase.sql`view_count + 1` })
      .eq('id', couponId)
  } catch (error) {
    console.error('Error incrementing coupon views:', error)
  }
}

export async function getFeaturedCoupons(limit = 5): Promise<CouponWithBusiness[]> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .lte('valid_from', new Date().toISOString())
      .gte('valid_until', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.error('Error fetching featured coupons:', error)
      return []
    }

    return data as CouponWithBusiness[]
  } catch (error) {
    console.error('Error in getFeaturedCoupons:', error)
    return []
  }
}

export async function searchCoupons(searchTerm: string): Promise<CouponWithBusiness[]> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .gte('valid_until', new Date().toISOString())
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,business.name.ilike.%${searchTerm}%`)
      .order('priority', { ascending: false })

    if (error || !data) {
      console.error('Error searching coupons:', error)
      return []
    }

    return data as CouponWithBusiness[]
  } catch (error) {
    console.error('Error in searchCoupons:', error)
    return []
  }
}

export async function getCouponsByCategory(category: string): Promise<CouponWithBusiness[]> {
  return getCoupons({ category })
}

export async function getBusinessCoupons(businessId: string): Promise<CouponWithBusiness[]> {
  return getCoupons({ business_id: businessId })
}
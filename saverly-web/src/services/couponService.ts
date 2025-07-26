import { supabase } from '../lib/supabase'
import type { Coupon } from '../lib/supabase'

export class CouponService {
  // Get all coupons with business info
  static async getCoupons(): Promise<(Coupon & { business: any })[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        business:businesses (
          id,
          name,
          category,
          city,
          state
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get coupons for a specific business
  static async getCouponsByBusiness(businessId: string): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get coupon by ID
  static async getCoupon(id: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Create new coupon
  static async createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .insert([coupon])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update coupon
  static async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete coupon
  static async deleteCoupon(id: string): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Get active coupons
  static async getActiveCoupons(): Promise<(Coupon & { business: any })[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        business:businesses (
          id,
          name,
          category,
          city,
          state,
          active
        )
      `)
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .eq('businesses.active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Search coupons
  static async searchCoupons(params: {
    businessId?: string
    category?: string
    activeOnly?: boolean
    dateRange?: { start: string; end: string }
  }): Promise<(Coupon & { business: any })[]> {
    let query = supabase
      .from('coupons')
      .select(`
        *,
        business:businesses (
          id,
          name,
          category,
          city,
          state,
          active
        )
      `)

    if (params.businessId) {
      query = query.eq('business_id', params.businessId)
    }

    if (params.category) {
      query = query.eq('businesses.category', params.category)
    }

    if (params.activeOnly) {
      const now = new Date().toISOString()
      query = query
        .eq('active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .eq('businesses.active', true)
    }

    if (params.dateRange) {
      query = query
        .gte('start_date', params.dateRange.start)
        .lte('end_date', params.dateRange.end)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Toggle coupon active status
  static async toggleCouponStatus(id: string): Promise<Coupon> {
    const coupon = await this.getCoupon(id)
    if (!coupon) throw new Error('Coupon not found')

    return this.updateCoupon(id, { active: !coupon.active })
  }
}
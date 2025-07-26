import { supabase } from '../lib/supabase'
import type { Business } from '../lib/supabase'

export class BusinessService {
  // Get all businesses
  static async getBusinesses(): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  // Get business by ID
  static async getBusiness(id: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Create new business
  static async createBusiness(business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> {
    const { data, error } = await supabase
      .from('businesses')
      .insert([business])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update business
  static async updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete business
  static async deleteBusiness(id: string): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Search businesses by category or location
  static async searchBusinesses(params: {
    category?: string
    city?: string
    state?: string
    active?: boolean
  }): Promise<Business[]> {
    let query = supabase.from('businesses').select('*')

    if (params.category) {
      query = query.eq('category', params.category)
    }
    if (params.city) {
      query = query.eq('city', params.city)
    }
    if (params.state) {
      query = query.eq('state', params.state)
    }
    if (params.active !== undefined) {
      query = query.eq('active', params.active)
    }

    const { data, error } = await query.order('name')

    if (error) throw error
    return data || []
  }

  // Get businesses with their coupons
  static async getBusinessesWithCoupons(): Promise<(Business & { coupons: any[] })[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        coupons (
          id,
          title,
          description,
          discount_amount,
          start_date,
          end_date,
          active
        )
      `)
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
  }
}
import { supabase } from '../lib/supabase'
import type { Business } from '../lib/supabase'
import { businessSchema, validateData, businessSearchSchema } from '../lib/validation'
import type { BusinessFormData } from '../lib/validation'
import { APIError, ValidationError, sanitizeError, logError } from '../lib/errors'

export class SecureBusinessService {
  // Get all businesses with pagination and filtering
  static async getBusinesses(params?: {
    page?: number
    limit?: number
    category?: string
    city?: string
    state?: string
    active?: boolean
  }): Promise<{
    data: Business[]
    count: number
    page: number
    totalPages: number
  }> {
    try {
      // Validate search parameters
      if (params) {
        const validation = validateData(businessSearchSchema, params)
        if (!validation.success) {
          throw new ValidationError('Invalid search parameters')
        }
      }

      const page = params?.page ?? 1
      const limit = Math.min(params?.limit ?? 20, 100) // Max 100 per page
      const offset = (page - 1) * limit

      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })

      // Apply filters
      if (params?.category) {
        query = query.eq('category', params.category)
      }
      if (params?.city) {
        query = query.ilike('city', `%${params.city}%`)
      }
      if (params?.state) {
        query = query.eq('state', params.state)
      }
      if (params?.active !== undefined) {
        query = query.eq('active', params.active)
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('name')

      if (error) {
        logError(error, { operation: 'getBusinesses', params })
        throw new APIError(sanitizeError(error), 'FETCH_ERROR')
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      logError(error, { operation: 'getBusinesses', params })
      throw new APIError('Failed to fetch businesses', 'UNKNOWN_ERROR')
    }
  }

  // Get business by ID with input validation
  static async getBusiness(id: string): Promise<Business | null> {
    try {
      // Validate UUID format
      if (!id || typeof id !== 'string' || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new ValidationError('Invalid business ID format')
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        logError(error, { operation: 'getBusiness', id })
        throw new APIError(sanitizeError(error), 'FETCH_ERROR')
      }

      return data
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      logError(error, { operation: 'getBusiness', id })
      throw new APIError('Failed to fetch business', 'UNKNOWN_ERROR')
    }
  }

  // Create new business with comprehensive validation
  static async createBusiness(businessData: BusinessFormData): Promise<Business> {
    try {
      // Validate input data
      const validation = validateData(businessSchema, businessData)
      if (!validation.success) {
        const firstError = Object.values(validation.errors)[0]
        throw new ValidationError(firstError)
      }

      const validatedData = validation.data

      // Additional business logic validation
      await this.validateBusinessUniqueness(validatedData.name, validatedData.email)

      const { data, error } = await supabase
        .from('businesses')
        .insert([validatedData])
        .select()
        .single()

      if (error) {
        logError(error, { operation: 'createBusiness', data: validatedData })
        
        if (error.code === '23505') { // Unique constraint violation
          throw new ValidationError('A business with this name or email already exists')
        }
        
        throw new APIError(sanitizeError(error), 'CREATE_ERROR')
      }

      return data
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      logError(error, { operation: 'createBusiness', data: businessData })
      throw new APIError('Failed to create business', 'UNKNOWN_ERROR')
    }
  }

  // Update business with validation and authorization
  static async updateBusiness(id: string, updates: Partial<BusinessFormData>): Promise<Business> {
    try {
      // Validate ID
      if (!id || typeof id !== 'string' || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new ValidationError('Invalid business ID format')
      }

      // Validate update data
      const partialSchema = businessSchema.partial()
      const validation = validateData(partialSchema, updates)
      if (!validation.success) {
        const firstError = Object.values(validation.errors)[0]
        throw new ValidationError(firstError)
      }

      const validatedUpdates = validation.data

      // Check if business exists
      const existingBusiness = await this.getBusiness(id)
      if (!existingBusiness) {
        throw new ValidationError('Business not found')
      }

      // Additional validation for name/email changes
      if (validatedUpdates.name || validatedUpdates.email) {
        await this.validateBusinessUniqueness(
          validatedUpdates.name || existingBusiness.name,
          validatedUpdates.email || existingBusiness.email,
          id
        )
      }

      const { data, error } = await supabase
        .from('businesses')
        .update(validatedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logError(error, { operation: 'updateBusiness', id, updates: validatedUpdates })
        throw new APIError(sanitizeError(error), 'UPDATE_ERROR')
      }

      return data
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      logError(error, { operation: 'updateBusiness', id, updates })
      throw new APIError('Failed to update business', 'UNKNOWN_ERROR')
    }
  }

  // Delete business with cascade checks
  static async deleteBusiness(id: string): Promise<void> {
    try {
      // Validate ID
      if (!id || typeof id !== 'string' || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new ValidationError('Invalid business ID format')
      }

      // Check if business has active coupons
      const { data: coupons, error: couponError } = await supabase
        .from('coupons')
        .select('id')
        .eq('business_id', id)
        .eq('active', true)
        .limit(1)

      if (couponError) {
        logError(couponError, { operation: 'deleteBusiness-checkCoupons', id })
        throw new APIError('Unable to verify business dependencies', 'CHECK_ERROR')
      }

      if (coupons && coupons.length > 0) {
        throw new ValidationError('Cannot delete business with active coupons. Please deactivate all coupons first.')
      }

      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id)

      if (error) {
        logError(error, { operation: 'deleteBusiness', id })
        throw new APIError(sanitizeError(error), 'DELETE_ERROR')
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      logError(error, { operation: 'deleteBusiness', id })
      throw new APIError('Failed to delete business', 'UNKNOWN_ERROR')
    }
  }

  // Private helper method to check business uniqueness
  private static async validateBusinessUniqueness(name: string, email: string, excludeId?: string): Promise<void> {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, email')
      .or(`name.ilike.${name},email.ilike.${email}`)

    if (error) {
      logError(error, { operation: 'validateBusinessUniqueness', name, email })
      throw new APIError('Unable to validate business uniqueness', 'VALIDATION_ERROR')
    }

    if (data && data.length > 0) {
      // Filter out the current business if we're updating
      const conflicts = excludeId ? data.filter(b => b.id !== excludeId) : data

      if (conflicts.length > 0) {
        const nameConflict = conflicts.find(b => b.name.toLowerCase() === name.toLowerCase())
        const emailConflict = conflicts.find(b => b.email.toLowerCase() === email.toLowerCase())

        if (nameConflict) {
          throw new ValidationError('A business with this name already exists')
        }
        if (emailConflict) {
          throw new ValidationError('A business with this email already exists')
        }
      }
    }
  }
}
import { z } from 'zod'

// Business validation schema
export const businessSchema = z.object({
  name: z.string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters')
    .trim(),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(val => val?.trim() || undefined),
  
  category: z.enum([
    'Food & Beverage',
    'Retail',
    'Health & Wellness',
    'Entertainment & Recreation',
    'Personal Services'
  ], {
    message: 'Please select a valid business category'
  }),
  
  address: z.string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters')
    .trim(),
  
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s\-']+$/, 'City can only contain letters, spaces, hyphens, and apostrophes'),
  
  state: z.string()
    .min(2, 'State is required')
    .max(50, 'State must be less than 50 characters')
    .trim(),
  
  zip_code: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
    .trim(),
  
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .finite('Latitude must be a valid number'),
  
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .finite('Longitude must be a valid number'),
  
  phone: z.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (123) 456-7890')
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase()
    .trim(),
  
  contact_name: z.string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Contact name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  logo_url: z.string()
    .url('Logo URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  active: z.boolean()
})

export type BusinessFormData = z.infer<typeof businessSchema>

// Coupon validation schema
export const couponSchema = z.object({
  business_id: z.string()
    .uuid('Invalid business ID'),
  
  title: z.string()
    .min(1, 'Coupon title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  description: z.string()
    .min(1, 'Coupon description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  
  discount_amount: z.string()
    .min(1, 'Discount amount is required')
    .max(50, 'Discount amount must be less than 50 characters')
    .trim(),
  
  terms: z.string()
    .max(1000, 'Terms must be less than 1000 characters')
    .optional()
    .transform(val => val?.trim() || undefined),
  
  usage_limit_type: z.enum([
    'once',
    'daily',
    'monthly_1',
    'monthly_2',
    'monthly_4'
  ], {
    message: 'Please select a valid usage limit type'
  }),
  
  start_date: z.string()
    .datetime('Start date must be a valid date'),
  
  end_date: z.string()
    .datetime('End date must be a valid date'),
  
  active: z.boolean()
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date']
  }
).refine(
  (data) => new Date(data.start_date) >= new Date(new Date().toDateString()),
  {
    message: 'Start date cannot be in the past',
    path: ['start_date']
  }
)

export type CouponFormData = z.infer<typeof couponSchema>

// Authentication validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters')
})

export const registerSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  confirmPassword: z.string(),
  
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods')
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// Search validation schemas
export const businessSearchSchema = z.object({
  category: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  active: z.boolean().optional()
})

// Utility function to safely parse and validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  errors: Record<string, string>
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err: any) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { 
      success: false, 
      errors: { general: 'Validation failed' }
    }
  }
}
// Custom error classes for better error handling
export class APIError extends Error {
  public code: string
  public statusCode?: number
  
  constructor(message: string, code: string, statusCode?: number) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.statusCode = statusCode
  }
}

export class ValidationError extends Error {
  public field?: string
  
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// Error sanitization to prevent information disclosure
export function sanitizeError(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message
  }
  
  if (error instanceof AuthError) {
    return error.message
  }
  
  if (error instanceof APIError) {
    // Only show safe error messages to users
    const safeMessages = [
      'Network error',
      'Service temporarily unavailable',
      'Invalid request'
    ]
    
    if (safeMessages.some(msg => error.message.includes(msg))) {
      return error.message
    }
    
    return 'An error occurred. Please try again.'
  }
  
  // For any other errors, show a generic message
  if (error instanceof Error) {
    // Log the actual error for debugging (in production, this would go to a logging service)
    console.error('Unhandled error:', error)
    
    // Check for common Supabase errors and provide user-friendly messages
    if (error.message.includes('duplicate key')) {
      return 'This record already exists'
    }
    
    if (error.message.includes('foreign key')) {
      return 'Unable to delete - this item is being used elsewhere'
    }
    
    if (error.message.includes('not found')) {
      return 'Item not found'
    }
    
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    }
  }
  
  return 'An unexpected error occurred. Please try again.'
}

// Error logging utility (in production, this would integrate with a service like Sentry)
export function logError(error: unknown, context?: Record<string, any>) {
  console.error('Error logged:', {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    timestamp: new Date().toISOString()
  })
  
  // In production, you would send this to your error tracking service
  // Example: Sentry.captureException(error, { contexts: { custom: context } })
}
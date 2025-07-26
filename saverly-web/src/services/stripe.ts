// Stripe integration matching original Replit approach
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export interface StripeCheckoutData {
  planType: 'monthly' | 'yearly'
  userFromFrontend: {
    id: string
    email: string
    full_name: string
  }
}

export interface StripeCheckoutResponse {
  data?: {
    sessionUrl: string
    sessionId: string
  }
  error?: string
}

// This matches the original Replit createStripeCheckoutSession function approach
export async function createStripeCheckoutSession(data: StripeCheckoutData): Promise<StripeCheckoutResponse> {
  try {
    // In the original Replit version, this called a server function
    // For now, we'll create a mock response that redirects to Stripe Checkout
    // In production, this would call your backend API endpoint
    
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return { data: result }
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)
    
    // Fallback: Create checkout session directly with Stripe (for development)
    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Development fallback - direct Stripe integration with proper error
      return {
        error: `Stripe checkout requires backend API. Please configure STRIPE_SECRET_KEY environment variable and deploy the /api/stripe/create-checkout-session endpoint.`
      }
    } catch (stripeError) {
      return {
        error: stripeError instanceof Error ? stripeError.message : 'Stripe integration error'
      }
    }
  }
}

// Original Replit also had createStripePortalSession
export async function createStripePortalSession(customerId: string): Promise<StripeCheckoutResponse> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return { data: result }
  } catch (error) {
    console.error('Stripe portal session creation failed:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to create portal session'
    }
  }
}

// Verify subscription status (matching Replit approach)
export async function verifySubscription(userId: string): Promise<{
  data?: {
    subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled'
    subscription_plan?: 'monthly' | 'yearly'
    expires_at?: string
  }
  error?: string
}> {
  try {
    const response = await fetch('/api/stripe/verify-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return { data: result }
  } catch (error) {
    console.error('Subscription verification failed:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to verify subscription'
    }
  }
}

// Utility functions matching original Replit patterns
export const STRIPE_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Subscription',
    price: 4.99,
    interval: 'month' as const,
    priceId: 'price_1234567890abcdef' // Replace with actual Stripe price ID
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Subscription',
    price: 49.00,
    interval: 'year' as const,
    priceId: 'price_0987654321fedcba', // Replace with actual Stripe price ID
    savings: 10.88
  }
} as const

export type StripePlanType = keyof typeof STRIPE_PLANS

// Handle subscription status updates (for webhook processing)
export function getSubscriptionDisplayStatus(status: string): {
  text: string
  color: string
  canUseApp: boolean
} {
  switch (status) {
    case 'active':
      return {
        text: 'Active',
        color: 'text-green-600',
        canUseApp: true
      }
    case 'trialing':
      return {
        text: 'Trial',
        color: 'text-blue-600',
        canUseApp: true
      }
    case 'past_due':
      return {
        text: 'Payment Required',
        color: 'text-orange-600',
        canUseApp: false
      }
    case 'canceled':
      return {
        text: 'Canceled',
        color: 'text-red-600',
        canUseApp: false
      }
    case 'inactive':
    default:
      return {
        text: 'Inactive',
        color: 'text-gray-600',
        canUseApp: false
      }
  }
}
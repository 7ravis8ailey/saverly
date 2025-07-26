import { useState } from 'react'
import { 
  createStripeCheckoutSession, 
  createStripePortalSession,
  verifySubscription,
  STRIPE_PLANS,
  type StripePlanType,
  type StripeCheckoutData 
} from '../services/stripe'
import { useAuth } from './useAuth'

// Use the plans from the stripe service (matching Replit approach)
export const subscriptionPlans = [
  {
    ...STRIPE_PLANS.monthly,
    features: [
      'Unlimited deal access',
      'Exclusive local offers',
      'New deals weekly',
      'Cancel anytime'
    ]
  },
  {
    ...STRIPE_PLANS.yearly,
    features: [
      'Unlimited deal access',
      'Exclusive local offers',
      'New deals weekly',
      'Priority support',
      'Cancel anytime',
      `Save $${STRIPE_PLANS.yearly.savings}/year!`
    ],
    popular: true
  }
]

export function useStripe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // This matches the original Replit handleSubscribe function approach
  const createCheckoutSession = async (planType: StripePlanType) => {
    if (!user || !user.id || !user.email) {
      setError('Please log in again before subscribing.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // WORKAROUND: Pass user data from frontend to avoid JWT bug (matching Replit comment)
      const checkoutData: StripeCheckoutData = {
        planType,
        userFromFrontend: {
          id: user.id,
          email: user.email,
          full_name: user.full_name || 'Unknown User'
        }
      }

      const { data, error: stripeError } = await createStripeCheckoutSession(checkoutData)
      
      if (stripeError) {
        throw new Error(stripeError)
      }

      if (data?.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        throw new Error('No session URL returned')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'There was an error processing your subscription. Please try again.'
      setError(errorMessage)
      console.error('Subscription error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createPortalSession = async (customerId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const session = await response.json()
      
      // Redirect to customer portal
      window.location.href = session.url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Stripe portal error:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createCheckoutSession,
    createPortalSession,
    plans: subscriptionPlans
  }
}
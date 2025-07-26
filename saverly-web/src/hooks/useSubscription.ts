import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { verifySubscription } from '../services/stripe'

export interface SubscriptionFeatures {
  // Core access - requires subscription
  viewDeals: boolean
  redeemDeals: boolean
  advancedSearch: boolean
  saveDeals: boolean
  exclusiveDeals: boolean
  prioritySupport: boolean
  analytics: boolean
  
  // Non-subscriber features
  viewProfile: boolean
  editProfile: boolean
  viewAboutPage: boolean
}

// Non-subscribers get NO access to deals - only profile and about page
export const NON_SUBSCRIBER_FEATURES: SubscriptionFeatures = {
  // NO deal access at all
  viewDeals: false,
  redeemDeals: false,
  advancedSearch: false,
  saveDeals: false,
  exclusiveDeals: false,
  prioritySupport: false,
  analytics: false,
  
  // Can view/edit profile and about page
  viewProfile: true,
  editProfile: true,
  viewAboutPage: true
}

// Subscribers get full access to everything
export const SUBSCRIBER_FEATURES: SubscriptionFeatures = {
  // Full deal access
  viewDeals: true,
  redeemDeals: true,
  advancedSearch: true,
  saveDeals: true,
  exclusiveDeals: true,
  prioritySupport: true,
  analytics: true,
  
  // Profile access
  viewProfile: true,
  editProfile: true,
  viewAboutPage: true
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<{
    status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
    plan?: 'monthly' | 'yearly'
    expires_at?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthlyUsage, setMonthlyUsage] = useState(0)

  // Determine if user has active subscription
  const isSubscribed = subscriptionData?.status === 'active' || subscriptionData?.status === 'trialing'
  
  // Get current subscription features - NO freemium, only subscription gate
  const features = isSubscribed ? SUBSCRIBER_FEATURES : NON_SUBSCRIBER_FEATURES
  
  // Can only redeem deals if subscribed
  const canRedeemDeals = isSubscribed
  
  // No free deals - must subscribe for any deal access
  const remainingFreeDeals = 0

  // Load subscription data
  const loadSubscriptionData = async () => {
    if (!user?.id) {
      setSubscriptionData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verify subscription with Stripe
      const { data, error: verifyError } = await verifySubscription(user.id)
      
      if (verifyError) {
        throw new Error(verifyError)
      }

      if (data) {
        setSubscriptionData({
          status: data.subscription_status,
          plan: data.subscription_plan,
          expires_at: data.expires_at
        })
      }

      // No usage tracking needed for subscription gate model
      setMonthlyUsage(0)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data')
      console.error('Subscription verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  // No tracking needed for subscription gate model
  const trackDealRedemption = () => {
    // No usage tracking in subscription gate model
    return
  }

  // Check if user can access a premium feature
  const canAccessFeature = (featureName: keyof SubscriptionFeatures): boolean => {
    return features[featureName] as boolean
  }

  // Get subscription message for locked features
  const getSubscriptionMessage = (featureName: keyof SubscriptionFeatures): string => {
    const messages: Record<string, string> = {
      viewDeals: 'Subscribe to Saverly Pro to access local deals and coupons',
      redeemDeals: 'Subscribe to Saverly Pro to redeem deals',
      advancedSearch: 'Subscribe to Saverly Pro for advanced search and filters',
      saveDeals: 'Subscribe to Saverly Pro to save your favorite deals',
      exclusiveDeals: 'Subscribe to Saverly Pro for exclusive deals',
      analytics: 'Subscribe to Saverly Pro for savings analytics'
    }
    
    return messages[featureName] || 'Subscribe to Saverly Pro for full access to all features'
  }

  useEffect(() => {
    loadSubscriptionData()
  }, [user?.id])

  return {
    // Subscription status
    isSubscribed,
    subscriptionData,
    loading,
    error,
    
    // Subscription access
    canRedeemDeals,
    
    // Feature access
    features,
    canAccessFeature,
    getSubscriptionMessage,
    
    // Actions
    refetch: loadSubscriptionData
  }
}
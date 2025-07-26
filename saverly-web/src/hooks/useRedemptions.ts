import { useState, useEffect } from 'react'
import { 
  createRedemption, 
  getUserRedemptions, 
  getRedemptionByQRCode,
  markRedemptionAsUsed,
  expireOldRedemptions,
  type Redemption,
  type CreateRedemptionData 
} from '../services/redemptions'
import { useAuth } from './useAuth'
import { useLocation } from './useLocation'

export function useRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadRedemptions = async () => {
    if (!user?.id) {
      setRedemptions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const data = await getUserRedemptions(user.id)
      setRedemptions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load redemptions')
      console.error('Error loading redemptions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRedemptions()
  }, [user?.id])

  const refetch = () => {
    loadRedemptions()
  }

  return {
    redemptions,
    loading,
    error,
    refetch
  }
}

export function useCreateRedemption() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { location } = useLocation()

  const createRedemptionCode = async (couponId: string): Promise<Redemption | null> => {
    if (!user?.id) {
      setError('User must be logged in to redeem coupons')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const redemptionData: CreateRedemptionData = {
        coupon_id: couponId,
        user_id: user.id,
        ...(location && {
          user_location: { latitude: location.latitude, longitude: location.longitude }
        })
      }

      const redemption = await createRedemption(redemptionData)
      
      if (!redemption) {
        throw new Error('Failed to create redemption')
      }

      return redemption
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create redemption'
      setError(errorMessage)
      console.error('Error creating redemption:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createRedemptionCode,
    loading,
    error
  }
}

export function useRedemption(qrCode?: string) {
  const [redemption, setRedemption] = useState<Redemption | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRedemption = async (code: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getRedemptionByQRCode(code)
      setRedemption(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load redemption')
      console.error('Error loading redemption:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (qrCode) {
      loadRedemption(qrCode)
    }
  }, [qrCode])

  const markAsUsed = async (location?: { latitude: number; longitude: number }): Promise<boolean> => {
    if (!redemption?.qr_code) {
      setError('No redemption to mark as used')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const success = await markRedemptionAsUsed(redemption.qr_code, location)
      if (success && redemption) {
        setRedemption({
          ...redemption,
          status: 'redeemed',
          redeemed_at: new Date().toISOString()
        })
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark redemption as used')
      console.error('Error marking redemption as used:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    redemption,
    loading,
    error,
    loadRedemption,
    markAsUsed
  }
}

// Utility hook to clean up expired redemptions (can be called periodically)
export function useRedemptionCleanup() {
  const cleanupExpiredRedemptions = async () => {
    try {
      await expireOldRedemptions()
    } catch (err) {
      console.error('Error cleaning up expired redemptions:', err)
    }
  }

  // Auto-cleanup on mount and every 5 minutes
  useEffect(() => {
    cleanupExpiredRedemptions()
    
    const interval = setInterval(cleanupExpiredRedemptions, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [])

  return {
    cleanupExpiredRedemptions
  }
}
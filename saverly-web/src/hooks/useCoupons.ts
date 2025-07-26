import { useState, useEffect } from 'react'
import { getCoupons, getCouponById, getFeaturedCoupons, searchCoupons, type CouponWithBusiness, type CouponFilters } from '../services/coupons'
import { useLocation } from './useLocation'

export function useCoupons(filters?: CouponFilters) {
  const [coupons, setCoupons] = useState<CouponWithBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { location } = useLocation()

  const loadCoupons = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const combinedFilters = {
        ...filters,
        ...(location && {
          user_location: { latitude: location.latitude, longitude: location.longitude }
        })
      }
      
      const data = await getCoupons(combinedFilters)
      setCoupons(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupons')
      console.error('Error loading coupons:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [location, filters?.category, filters?.business_id, filters?.subscription_required])

  const refetch = () => {
    loadCoupons()
  }

  return {
    coupons,
    loading,
    error,
    refetch
  }
}

export function useCoupon(couponId: string) {
  const [coupon, setCoupon] = useState<CouponWithBusiness | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCoupon = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await getCouponById(couponId)
        setCoupon(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load coupon')
        console.error('Error loading coupon:', err)
      } finally {
        setLoading(false)
      }
    }

    if (couponId) {
      loadCoupon()
    }
  }, [couponId])

  return {
    coupon,
    loading,
    error
  }
}

export function useFeaturedCoupons(limit = 5) {
  const [coupons, setCoupons] = useState<CouponWithBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFeatured = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await getFeaturedCoupons(limit)
        setCoupons(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load featured coupons')
        console.error('Error loading featured coupons:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFeatured()
  }, [limit])

  return {
    coupons,
    loading,
    error
  }
}

export function useCouponSearch() {
  const [results, setResults] = useState<CouponWithBusiness[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const data = await searchCoupons(searchTerm)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search coupons')
      console.error('Error searching coupons:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setError(null)
  }

  return {
    results,
    loading,
    error,
    search,
    clearResults
  }
}
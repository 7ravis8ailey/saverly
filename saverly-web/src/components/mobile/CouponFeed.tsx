import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, MapPinIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import { Coupon, Business } from '../../lib/supabase'
import { useCoupons } from '../../hooks/useCoupons'
import { useLocation } from '../../hooks/useLocation'
import { CouponCard } from './CouponCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface CouponWithBusiness extends Coupon {
  business: Business
  distance?: number
}

export function CouponFeed() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'distance' | 'savings' | 'expiring'>('distance')
  
  const { coupons, loading, error, refetch } = useCoupons()
  const { location, requesting: locationLoading } = useLocation()

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'Food & Beverage', name: 'Food & Drink' },
    { id: 'Retail', name: 'Shopping' },
    { id: 'Health & Wellness', name: 'Health' },
    { id: 'Entertainment & Recreation', name: 'Fun' },
    { id: 'Personal Services', name: 'Services' }
  ]

  // Calculate distances and filter coupons
  const processedCoupons = coupons
    ?.map(coupon => {
      const couponWithBusiness = coupon as CouponWithBusiness
      if (location && coupon.business) {
        // Simple distance calculation (not perfect but good enough for demo)
        const lat1 = location.latitude
        const lon1 = location.longitude
        const lat2 = coupon.business.latitude
        const lon2 = coupon.business.longitude
        
        const R = 6371 // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c * 0.621371 // Convert to miles
        
        couponWithBusiness.distance = distance
      }
      return couponWithBusiness
    })
    .filter(coupon => {
      // Filter by search term
      if (searchTerm && !coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !coupon.business?.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Filter by category
      if (selectedCategory !== 'all' && coupon.business?.category !== selectedCategory) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 999) - (b.distance || 999)
        case 'expiring':
          return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime()
        case 'savings':
          return b.discount_value - a.discount_value
        default:
          return 0
      }
    })

  // All coupons available to subscribers
  const displayCoupons = processedCoupons

  if (loading || locationLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading coupons</p>
          <button onClick={refetch} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Local Deals
                <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  Pro
                </span>
              </h1>
              <p className="text-gray-600 text-sm">
                {location 
                  ? `${displayCoupons?.length || 0} deals near you`
                  : 'Enable location for personalized deals'
                }
              </p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <HeartIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals or businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-4">
          {[
            { id: 'distance', name: 'Nearest', icon: MapPinIcon },
            { id: 'expiring', name: 'Ending Soon', icon: ClockIcon },
            { id: 'savings', name: 'Best Deals', icon: TagIcon }
          ].map(option => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                sortBy === option.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Coupon List */}
      <div className="p-4 pb-24">
        {displayCoupons?.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or category filters
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayCoupons?.map(coupon => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                distance={coupon.distance}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
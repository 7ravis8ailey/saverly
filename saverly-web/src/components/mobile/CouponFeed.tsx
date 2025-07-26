import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ClockIcon, 
  TagIcon,
  FunnelIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import type { Coupon, Business } from '../../lib/supabase'
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
  const [showFilters, setShowFilters] = useState(false)
  
  const { coupons, loading, error, refetch } = useCoupons()
  const { location, requesting: locationLoading } = useLocation()

  const categories = [
    { id: 'all', name: 'All', icon: '🏪' },
    { id: 'Food & Beverage', name: 'Food', icon: '🍕' },
    { id: 'Retail', name: 'Shopping', icon: '🛍️' },
    { id: 'Health & Wellness', name: 'Health', icon: '🏥' },
    { id: 'Entertainment & Recreation', name: 'Fun', icon: '🎬' },
    { id: 'Personal Services', name: 'Services', icon: '✂️' }
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Finding the best deals near you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TagIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Deals
          </h3>
          <p className="text-red-600 mb-4">
            {error.message || 'Error loading coupons'}
          </p>
          <button onClick={refetch} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 safe-top">
        <div className="px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Saverly
              </span>
            </h1>
            <p className="text-gray-600 mt-2">
              {location 
                ? `${displayCoupons?.length || 0} deals near you`
                : 'Enable location for personalized deals'
              }
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search deals, businesses, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <span className="text-base">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Sort Options */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-2">
          {[
            { id: 'distance', name: 'Nearest', icon: MapPinIcon, desc: 'Closest to you' },
            { id: 'expiring', name: 'Ending Soon', icon: ClockIcon, desc: 'Limited time' },
            { id: 'savings', name: 'Best Value', icon: TagIcon, desc: 'Biggest savings' }
          ].map(option => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortBy === option.id
                  ? 'bg-primary-100 text-primary-700 shadow-sm transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <option.icon className="w-4 h-4" />
              <div className="text-left">
                <div>{option.name}</div>
                {sortBy === option.id && (
                  <div className="text-xs text-primary-600">{option.desc}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {location && (
        <div className="bg-primary-50 border-b border-primary-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-primary-700">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {displayCoupons?.length || 0} deals found
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </span>
            </div>
            {(searchTerm || selectedCategory !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Coupon List */}
      <div className="p-4 pb-24">
        {displayCoupons?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No deals found</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your search or category filters to find more deals."
                : "We're working on adding more deals in your area. Check back soon!"
              }
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="btn-primary"
              >
                Show All Deals
              </button>
              <button 
                onClick={refetch}
                className="btn-secondary block"
              >
                Refresh Deals
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayCoupons?.map((coupon, index) => (
              <div key={coupon.id} className="animate-slide-up" style={{animationDelay: `${index * 50}ms`}}>
                <CouponCard
                  coupon={coupon}
                  distance={coupon.distance}
                />
              </div>
            ))}
            
            {/* Load More Placeholder */}
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                You're all caught up! 🎉
              </p>
              <p className="text-gray-400 text-xs mt-1">
                New deals are added daily
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
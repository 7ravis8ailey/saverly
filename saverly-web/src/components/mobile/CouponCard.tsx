import { useState } from 'react'
import { MapPinIcon, ClockIcon, BuildingStorefrontIcon, TagIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import type { Coupon, Business } from '../../lib/supabase'

interface CouponWithBusiness extends Coupon {
  business: Business
  distance?: number
}

interface CouponCardProps {
  coupon: CouponWithBusiness
  distance?: number
  isManagement?: boolean
}

export function CouponCard({ coupon, distance }: CouponCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const formatDistance = (dist?: number) => {
    if (!dist) return ''
    return dist < 1 ? `${Math.round(dist * 10) / 10} mi` : `${Math.round(dist)} mi`
  }

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffInHours = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h left`
    } else {
      const days = Math.ceil(diffInHours / 24)
      return `${days}d left`
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Food & Beverage': 'bg-orange-100 text-orange-800',
      'Retail': 'bg-blue-100 text-blue-800', 
      'Health & Wellness': 'bg-green-100 text-green-800',
      'Entertainment & Recreation': 'bg-purple-100 text-purple-800',
      'Personal Services': 'bg-pink-100 text-pink-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Link to={`/coupon/${coupon.id}`}>
      <div className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow bg-white rounded-xl shadow-md border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-600">
              {coupon.business?.name || "Business Name Unavailable"}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsFavorited(!isFavorited)
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              {isFavorited ? (
                <HeartSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartOutline className="w-5 h-5" />
              )}
            </button>
          </div>
          <span className="text-xl font-semibold text-gray-900">{coupon.title}</span>
        </div>

        {/* Content */}
        <p className="text-gray-600 mb-4">{coupon.description}</p>
        
        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            Valid until {new Date(coupon.valid_until).toLocaleDateString()}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <TagIcon className="h-4 w-4 mr-2" />
            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
            {coupon.business?.name || "Business Name Unavailable"}
          </div>
          
          {distance && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {formatDistance(distance)} away
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
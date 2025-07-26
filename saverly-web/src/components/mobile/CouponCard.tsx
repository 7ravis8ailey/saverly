import { useState } from 'react'
import { MapPinIcon, ClockIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { Coupon, Business } from '../../lib/supabase'

interface CouponWithBusiness extends Coupon {
  business: Business
  distance?: number
}

interface CouponCardProps {
  coupon: CouponWithBusiness
  distance?: number
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
    <div className="coupon-card group">
      {/* Header with business info and favorite button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            {coupon.business?.logo_url ? (
              <img
                src={coupon.business.logo_url}
                alt={coupon.business.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <BuildingStorefrontIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {coupon.business?.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {distance && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{formatDistance(distance)}</span>
                </div>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(coupon.business?.category || '')}`}>
                {coupon.business?.category?.replace(' & ', ' ')}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
        >
          {isFavorited ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartOutline className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Coupon content */}
      <div className="mb-4">
        <h4 className="text-lg font-bold text-gray-900 mb-2">
          {coupon.title}
        </h4>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {coupon.description}
        </p>
        
        {/* Discount badge */}
        <div className="inline-flex items-center bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
          {coupon.discount_amount}
        </div>
      </div>

      {/* Footer with time remaining and action button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatTimeRemaining(coupon.end_date)}</span>
          </div>
          {coupon.usage_limit_type !== 'once' && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {coupon.usage_limit_type.replace('_', ' per ').replace('monthly', 'month')}
            </span>
          )}
        </div>
        
        <Link
          to={`/coupon/${coupon.id}`}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          View Deal
        </Link>
      </div>
    </div>
  )
}
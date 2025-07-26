import { useState } from 'react'
import { 
  LockClosedIcon, 
  StarIcon, 
  HeartIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useSubscription } from '../../hooks/useSubscription'
import SubscriptionModal from './SubscriptionModal'

interface SubscriptionGateProps {
  feature: 'advancedSearch' | 'saveDeals' | 'exclusiveDeals' | 'analytics' | 'unlimitedDeals'
  children: React.ReactNode
  fallback?: React.ReactNode
}

const FEATURE_ICONS = {
  advancedSearch: MagnifyingGlassIcon,
  saveDeals: HeartIcon,
  exclusiveDeals: StarIcon,
  analytics: ChartBarIcon,
  unlimitedDeals: StarIcon
}

const FEATURE_TITLES = {
  advancedSearch: 'Advanced Search & Filters',
  saveDeals: 'Save Favorite Deals',
  exclusiveDeals: 'Exclusive Premium Deals',
  analytics: 'Savings Analytics',
  unlimitedDeals: 'Unlimited Deal Access'
}

export function SubscriptionGate({ feature, children, fallback }: SubscriptionGateProps) {
  const { canAccessFeature, getUpgradeMessage } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // If user can access the feature, render children
  if (canAccessFeature(feature)) {
    return <>{children}</>
  }

  // If fallback is provided, use it instead of the default upgrade prompt
  if (fallback) {
    return <>{fallback}</>
  }

  // Default upgrade prompt
  const IconComponent = FEATURE_ICONS[feature]
  const title = FEATURE_TITLES[feature]
  const message = getUpgradeMessage(feature)

  return (
    <>
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6 text-center">
        <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
          <IconComponent className="w-8 h-8 text-primary-600" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
            <LockClosedIcon className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm">
          {message}
        </p>
        
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Upgrade to Saverly Pro
        </button>
        
        <div className="mt-4 text-xs text-gray-500">
          Starting at $4.99/month • Cancel anytime
        </div>
      </div>

      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  )
}

// Inline subscription gate for smaller prompts
export function InlineSubscriptionGate({ feature, children }: Omit<SubscriptionGateProps, 'fallback'>) {
  const { canAccessFeature } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  if (canAccessFeature(feature)) {
    return <>{children}</>
  }

  return (
    <>
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            <LockClosedIcon className="w-4 h-4" />
            <span>Upgrade to Unlock</span>
          </button>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  )
}

// Deal limit reached component
export function DealLimitReached() {
  const { monthlyUsage, remainingFreeDeals } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  return (
    <>
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LockClosedIcon className="w-8 h-8 text-orange-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Monthly Deal Limit Reached
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm">
          You've used all {monthlyUsage} of your free deals this month. 
          Upgrade to Saverly Pro for unlimited access to all deals!
        </p>
        
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Upgrade for Unlimited Deals
        </button>
        
        <div className="mt-4 text-xs text-gray-500">
          Your free deals reset next month • Upgrade now for instant access
        </div>
      </div>

      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  )
}
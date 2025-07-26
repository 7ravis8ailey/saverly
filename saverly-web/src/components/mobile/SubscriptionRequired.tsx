import { useState } from 'react'
import { 
  LockClosedIcon,
  ShoppingBagIcon,
  StarIcon,
  MapPinIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import { useSubscription } from '../../hooks/useSubscription'
import SubscriptionModal from './SubscriptionModal'

interface SubscriptionRequiredProps {
  title?: string
  message?: string
  showFeatures?: boolean
}

export function SubscriptionRequired({ 
  title = "Subscription Required",
  message = "Subscribe to Saverly Pro to access all local deals and exclusive offers.",
  showFeatures = true
}: SubscriptionRequiredProps) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  const features = [
    {
      icon: ShoppingBagIcon,
      title: "Unlimited Local Deals",
      description: "Access all coupons from Northeast Tennessee businesses"
    },
    {
      icon: MapPinIcon,
      title: "Location-Based Discovery",
      description: "Find deals near you with GPS-powered sorting"
    },
    {
      icon: QrCodeIcon,
      title: "QR Code Redemption",
      description: "Secure, digital coupon redemption system"
    },
    {
      icon: StarIcon,
      title: "Exclusive Offers",
      description: "Premium deals only available to subscribers"
    }
  ]

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Lock Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600">
              {message}
            </p>
          </div>

          {/* Features Preview */}
          {showFeatures && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                What You'll Get with Saverly Pro
              </h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription CTA */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white text-center">
            <div className="text-3xl font-bold mb-1">$4.99</div>
            <div className="text-primary-100 text-sm mb-4">per month • Cancel anytime</div>
            
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="w-full bg-white text-primary-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Subscribe Now
            </button>
            
            <p className="text-primary-100 text-xs mt-3">
              Secure payment • Instant access • No commitment
            </p>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  )
}

// Inline subscription prompt for smaller spaces
export function InlineSubscriptionRequired({ message }: { message?: string }) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  return (
    <>
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6 text-center">
        <LockClosedIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Subscription Required
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          {message || "Subscribe to Saverly Pro to access this feature and all local deals."}
        </p>
        <button
          onClick={() => setShowSubscriptionModal(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
        >
          Subscribe for $4.99/month
        </button>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  )
}
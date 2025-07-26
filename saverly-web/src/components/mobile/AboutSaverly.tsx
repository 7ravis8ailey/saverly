import { useState } from 'react'
import { 
  ShoppingBagIcon, 
  MapPinIcon, 
  QrCodeIcon,
  StarIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useSubscription } from '../../hooks/useSubscription'
import SubscriptionModal from './SubscriptionModal'

export function AboutSaverly() {
  const { isSubscribed } = useSubscription()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  const features = [
    {
      icon: ShoppingBagIcon,
      title: "Local Business Deals",
      description: "Discover exclusive coupons and discounts from your favorite local Northeast Tennessee businesses"
    },
    {
      icon: MapPinIcon,
      title: "Location-Based Discovery",
      description: "Find deals near you with GPS-powered location services and distance sorting"
    },
    {
      icon: QrCodeIcon,
      title: "Digital QR Redemption",
      description: "Simple, secure QR code redemption system with backup verification codes"
    },
    {
      icon: StarIcon,
      title: "Exclusive Subscriber Offers",
      description: "Access premium deals and discounts available only to Saverly subscribers"
    }
  ]

  const benefits = [
    "Unlimited access to all local deals",
    "New deals added weekly",
    "Advanced search and filtering",
    "Save favorite businesses",
    "GPS-based deal discovery",
    "Secure QR code redemption",
    "Exclusive subscriber-only offers",
    "Priority customer support"
  ]

  if (isSubscribed) {
    // If user is already subscribed, show a welcome message instead
    return (
      <div className="min-h-screen bg-gray-50 safe-top">
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-6 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Saverly Pro!
            </h1>
            <p className="text-gray-600">
              You have full access to all deals and features
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ready to start saving?
            </h2>
            <p className="text-gray-600 mb-6">
              Explore local deals in your area and start redeeming exclusive offers
            </p>
            <button 
              onClick={() => window.location.href = '/app'}
              className="btn-primary w-full"
            >
              Browse Deals
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 safe-top">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="px-4 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Saverly
              </span>
            </h1>
            <p className="text-primary-100 text-lg">
              Your Local Coupon Marketplace
            </p>
          </div>
        </div>

        {/* What is Saverly */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Connecting You with Local Savings
            </h2>
            <p className="text-gray-600 text-center leading-relaxed">
              Saverly brings together local businesses and savvy shoppers in Northeast Tennessee. 
              Discover exclusive deals, support your community, and save money with our digital coupon platform.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How Saverly Works
          </h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Benefits */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
            <div className="text-center mb-6">
              <CreditCardIcon className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Saverly Pro Subscription
              </h3>
              <p className="text-gray-600 mb-4">
                Unlock unlimited access to all local deals for just
              </p>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                $4.99
              </div>
              <div className="text-gray-500 text-sm">
                per month • Cancel anytime
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Start Your Subscription
            </button>

            <p className="text-center text-gray-500 text-xs mt-3">
              Secure payment powered by Stripe • No long-term commitment
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pb-24">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Supporting Local Business
            </h4>
            <p className="text-gray-600 text-sm">
              Every subscription helps local Northeast Tennessee businesses reach more customers 
              and grow their community presence. Join us in strengthening our local economy.
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
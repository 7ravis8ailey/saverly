import { Link } from 'react-router-dom'
import { 
  MapPinIcon, 
  TagIcon, 
  CreditCardIcon, 
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'

export function WelcomeScreen() {
  const subscriptionFeatures = [
    "Unlimited access to all deals",
    "Exclusive member-only offers",
    "Early access to new coupons",
    "No ads or interruptions"
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="safe-top pt-8 pb-6">
        <div className="text-center px-6">
          {/* Brand Name - Simple and Clean */}
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            Saverly
          </h1>
          
          {/* Tagline */}
          <p className="text-lg text-gray-600 mb-6">
            Your Local Coupon Marketplace
          </p>
          
          {/* Location Badge */}
          <div className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
            <MapPinIcon className="w-4 h-4 mr-2" />
            Northeast Tennessee
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6">
        <div className="max-w-sm mx-auto w-full">
          {/* Subscription Status Card */}
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Subscription Status</h2>
              <span className="text-sm text-gray-500">Not Active</span>
            </div>
            
            <div className="space-y-3 mb-6">
              {subscriptionFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-900">$4.99<span className="text-lg font-normal text-gray-600">/month</span></p>
              <p className="text-sm text-gray-500">Cancel anytime</p>
            </div>
            
            <Link to="/register" className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors">
              Start Free Trial
            </Link>
          </div>
          
          {/* Available Deals Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Deals</h2>
            
            {/* Deal Categories Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
              <button className="pb-2 px-1 text-sm font-medium text-gray-900 border-b-2 border-green-500">
                All Deals
              </button>
              <button className="pb-2 px-1 text-sm font-medium text-gray-500">
                Food & Drink
              </button>
              <button className="pb-2 px-1 text-sm font-medium text-gray-500">
                Services
              </button>
            </div>
            
            {/* Sample Deal Cards */}
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">The Coffee House</h3>
                  <span className="text-green-600 font-semibold">20% OFF</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Any large specialty drink</p>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  0.3 miles away
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">Pizza Palace</h3>
                  <span className="text-green-600 font-semibold">Buy 1 Get 1</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Medium pizzas every Tuesday</p>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  0.5 miles away
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">Quick Lube Express</h3>
                  <span className="text-green-600 font-semibold">$10 OFF</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Full service oil change</p>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  1.2 miles away
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Actions */}
      <div className="safe-bottom pb-6 px-6">
        <div className="max-w-sm mx-auto space-y-3">
          <Link to="/login" className="block w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg text-center transition-colors border border-gray-300">
            Sign In
          </Link>
          
          <button 
            onClick={() => {/* TODO: Skip to guest mode */}}
            className="text-gray-500 text-sm hover:text-gray-600 transition-colors text-center w-full flex items-center justify-center"
          >
            Continue as guest
            <ArrowRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
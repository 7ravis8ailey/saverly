import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPinIcon, 
  TagIcon, 
  CreditCardIcon, 
  QrCodeIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      icon: <MapPinIcon className="w-16 h-16 text-primary-500" />,
      title: "Local Deals Near You",
      description: "Discover amazing deals from businesses in your neighborhood with location-based sorting.",
      highlight: "50+ Local Businesses"
    },
    {
      icon: <QrCodeIcon className="w-16 h-16 text-primary-500" />,
      title: "Easy QR Redemption", 
      description: "Redeem coupons instantly with QR codes. Show your phone at checkout - it's that simple!",
      highlight: "Instant Redemption"
    },
    {
      icon: <TagIcon className="w-16 h-16 text-primary-500" />,
      title: "Exclusive Savings",
      description: "Access subscriber-only deals and save money at your favorite local businesses.",
      highlight: "Up to 50% Off"
    },
    {
      icon: <CreditCardIcon className="w-16 h-16 text-primary-500" />,
      title: "Just $4.99/Month",
      description: "Unlimited access to all local deals for less than the cost of a coffee!",
      highlight: "Cancel Anytime"
    }
  ]

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [features.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col animate-fade-in">
      {/* Hero Section */}
      <div className="safe-top pt-12 pb-8">
        <div className="text-center px-6">
          {/* Logo with animation */}
          <div className="mb-6 animate-bounce-subtle">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          {/* Brand Name */}
          <h1 className="text-5xl font-extrabold mb-3">
            <span className="text-gray-900">Save</span>
            <span className="text-primary-500">rly</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-xl text-gray-600 font-medium mb-2">
            Your Local Coupon Marketplace
          </p>
          
          {/* Location Badge */}
          <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
            <MapPinIcon className="w-4 h-4 mr-2" />
            Northeast Tennessee
          </div>
        </div>
      </div>

      {/* Feature Carousel */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-sm mx-auto w-full">
          {/* Main Feature Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-gray-100 animate-slide-up">
            {/* Feature Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
                {features[currentSlide].icon}
              </div>
            </div>
            
            {/* Feature Content */}
            <div className="text-center">
              {/* Highlight Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                <StarIcon className="w-3 h-3 mr-1" />
                {features[currentSlide].highlight}
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {features[currentSlide].title}
              </h2>
              
              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed">
                {features[currentSlide].description}
              </p>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-3 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mb-8">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="flex items-center text-primary-500 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-primary-600 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentSlide(Math.min(features.length - 1, currentSlide + 1))}
              disabled={currentSlide === features.length - 1}
              className="flex items-center text-primary-500 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed hover:text-primary-600 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="px-6 mb-8">
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-2">
                "I've saved over $200 this month using Saverly!"
              </p>
              <p className="text-xs text-gray-500 font-medium">
                - Sarah M., Johnson City
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="safe-bottom pb-8 px-6">
        <div className="max-w-sm mx-auto space-y-4">
          {/* Primary CTA */}
          <Link to="/register" className="btn-primary block text-center">
            <div className="flex items-center justify-center">
              <HeartIcon className="w-5 h-5 mr-2" />
              Get Started - Sign Up Free
            </div>
          </Link>
          
          {/* Secondary CTA */}
          <Link to="/login" className="btn-secondary block text-center">
            Already have an account? Sign In
          </Link>
          
          {/* Pricing Preview */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 mb-2">
              Unlimited access for just <span className="font-bold text-primary-600">$4.99/month</span>
            </p>
            <button 
              onClick={() => {/* TODO: Skip to guest mode */}}
              className="text-gray-500 text-sm underline hover:text-gray-600 transition-colors"
            >
              Browse as guest (limited features)
            </button>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary-200 to-secondary-300 rounded-full opacity-20"></div>
      </div>
    </div>
  )
}
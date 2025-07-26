import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, TagIcon, CreditCardIcon, QrCodeIcon } from '@heroicons/react/24/outline'

export function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      icon: <MapPinIcon className="w-12 h-12 text-primary-500" />,
      title: "Local Deals Near You",
      description: "Discover amazing deals from businesses in your neighborhood with location-based sorting."
    },
    {
      icon: <QrCodeIcon className="w-12 h-12 text-primary-500" />,
      title: "Easy QR Redemption",
      description: "Redeem coupons instantly with QR codes. Show your phone at checkout - it's that simple!"
    },
    {
      icon: <TagIcon className="w-12 h-12 text-primary-500" />,
      title: "Exclusive Savings",
      description: "Access subscriber-only deals and save money at your favorite local businesses."
    },
    {
      icon: <CreditCardIcon className="w-12 h-12 text-primary-500" />,
      title: "Just $4.99/Month",
      description: "Unlimited access to all local deals for less than the cost of a coffee!"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      {/* Header */}
      <div className="safe-top pt-8 pb-4">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Save<span className="text-primary-500">rly</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Your local coupon marketplace
          </p>
        </div>
      </div>

      {/* Feature Carousel */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 mx-auto max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {features[currentSlide].icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {features[currentSlide].title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {features[currentSlide].description}
            </p>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="text-primary-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentSlide(Math.min(features.length - 1, currentSlide + 1))}
              disabled={currentSlide === features.length - 1}
              className="text-primary-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="safe-bottom pb-8 px-6 space-y-4">
        <Link to="/register" className="btn-primary block text-center">
          Get Started - Sign Up Free
        </Link>
        <Link to="/login" className="btn-outline block text-center">
          Already have an account? Sign In
        </Link>
        
        <div className="text-center pt-4">
          <button 
            onClick={() => {/* TODO: Skip to guest mode */}}
            className="text-gray-500 text-sm underline"
          >
            Browse as guest (limited features)
          </button>
        </div>
      </div>
    </div>
  )
}
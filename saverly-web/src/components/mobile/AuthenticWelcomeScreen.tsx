import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserIcon } from '@heroicons/react/24/outline'

export function AuthenticWelcomeScreen() {
  const [activeTab, setActiveTab] = useState('available')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Saverly</h1>
          <UserIcon className="w-6 h-6 text-gray-600" />
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Subscription Status Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-black mb-4">Subscription Status</h2>
          
          <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            ● Active
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">Valid until: 2/22/2025</p>
            <p className="text-gray-600">Plan: Monthly</p>
          </div>
        </div>

        {/* Deals Section */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 px-6 py-3 text-center font-medium ${
                activeTab === 'available'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Available Coupons
            </button>
            <button
              onClick={() => setActiveTab('yours')}
              className={`flex-1 px-6 py-3 text-center font-medium ${
                activeTab === 'yours'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Your Coupons
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'available' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-black">Available Deals</h3>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                    <option>Distance</option>
                    <option>Ending Soon</option>
                    <option>Best Value</option>
                  </select>
                </div>
                
                <div className="text-center py-12 text-gray-500">
                  No coupons available in your area yet.
                </div>
              </div>
            )}
            
            {activeTab === 'yours' && (
              <div className="text-center py-12 text-gray-500">
                No coupons available in your area yet.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <Link
            to="/register"
            className="block bg-gray-900 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Get Started - Sign Up Free
          </Link>
          
          <Link
            to="/login"
            className="block bg-white text-gray-700 text-center py-3 px-6 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomeScreen } from './WelcomeScreen'
import { CouponFeed } from './CouponFeed'
import { QRRedemption } from './QRRedemption'
import { AboutSaverly } from './AboutSaverly'
import { SubscriptionRequired } from './SubscriptionRequired'
import { MobileNavigation } from './MobileNavigation'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { FullScreenLoader } from '../ui/LoadingSpinner'

export function MobileApp() {
  const { user, loading } = useAuth()
  const { isSubscribed, loading: subscriptionLoading } = useSubscription()

  if (loading || subscriptionLoading) {
    return <FullScreenLoader message="Loading Saverly..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Welcome/Landing screens */}
        <Route path="/" element={
          user ? (
            isSubscribed ? <Navigate to="/app" replace /> : <Navigate to="/app/about" replace />
          ) : (
            <WelcomeScreen />
          )
        } />
        
        {/* About Saverly - available to all logged-in users */}
        <Route path="/app/about" element={
          <ProtectedRoute>
            <div className="pb-16">
              <AboutSaverly />
            </div>
            <MobileNavigation />
          </ProtectedRoute>
        } />

        {/* Deal routes - require subscription */}
        <Route path="/app" element={
          <ProtectedRoute>
            <div className="pb-16">
              {isSubscribed ? <CouponFeed /> : <SubscriptionRequired />}
            </div>
            <MobileNavigation />
          </ProtectedRoute>
        } />
        
        <Route path="/app/search" element={
          <ProtectedRoute>
            <div className="pb-16">
              {isSubscribed ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Search</h2>
                    <p className="text-gray-600">Coming soon - enhanced search features!</p>
                  </div>
                </div>
              ) : (
                <SubscriptionRequired 
                  title="Search Requires Subscription"
                  message="Subscribe to Saverly Pro to search and filter local deals."
                />
              )}
            </div>
            <MobileNavigation />
          </ProtectedRoute>
        } />
        
        <Route path="/app/favorites" element={
          <ProtectedRoute>
            <div className="pb-16">
              {isSubscribed ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Favorites</h2>
                    <p className="text-gray-600">Save deals you love to see them here!</p>
                  </div>
                </div>
              ) : (
                <SubscriptionRequired 
                  title="Favorites Require Subscription"
                  message="Subscribe to Saverly Pro to save your favorite deals and businesses."
                />
              )}
            </div>
            <MobileNavigation />
          </ProtectedRoute>
        } />
        
        <Route path="/app/subscription" element={
          <ProtectedRoute>
            <div className="pb-16">
              <SubscriptionScreen />
            </div>
            <MobileNavigation />
          </ProtectedRoute>
        } />
        
        <Route path="/app/profile" element={
          <ProtectedRoute>
            <div className="pb-16">
              <ProfileScreen />
            </div>
            <MobileNavigation />
          </ProtectedRoute>
        } />
        
        {/* QR Redemption (full screen, no nav) - requires subscription */}
        <Route path="/coupon/:couponId/redeem" element={
          <ProtectedRoute>
            {isSubscribed ? <QRRedemption /> : <SubscriptionRequired />}
          </ProtectedRoute>
        } />
        
        {/* Coupon details - requires subscription */}
        <Route path="/coupon/:couponId" element={
          <ProtectedRoute>
            {isSubscribed ? <CouponDetailsScreen /> : <SubscriptionRequired />}
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// Placeholder components for subscription and profile screens
function SubscriptionScreen() {
  return (
    <div className="min-h-screen bg-gray-50 safe-top">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-600">Manage your Saverly subscription</p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">$4.99</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Monthly Subscription</h2>
            <p className="text-gray-600">
              Unlimited access to all local deals
            </p>
          </div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Unlimited coupon access</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Location-based deal discovery</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">QR code redemption</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700">Cancel anytime</span>
            </li>
          </ul>
          
          <button className="btn-primary w-full">
            Subscribe Now - $4.99/month
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Subscription includes access to all participating businesses in Northeast TN</p>
        </div>
      </div>
    </div>
  )
}

function ProfileScreen() {
  const { user, signOut } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50 safe-top">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Member Since</label>
              <p className="text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Account Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Edit Profile
            </button>
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Notification Settings  
            </button>
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Privacy Settings
            </button>
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Help & Support
            </button>
          </div>
        </div>
        
        {/* Sign Out */}
        <button
          onClick={() => signOut()}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function CouponDetailsScreen() {
  // This would show detailed coupon info before redemption
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center p-6">
        <h2 className="text-xl font-bold">Coupon Details</h2>
        <p>Coming soon - detailed coupon view with redemption option</p>
      </div>
    </div>
  )
}
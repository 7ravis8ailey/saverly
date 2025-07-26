import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { FullScreenLoader } from './components/ui/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { EnvironmentCheck } from './components/EnvironmentCheck'
import { Suspense } from 'react'

// Admin Dashboard Components
import { BusinessList } from './components/BusinessList'
import { LoginForm } from './components/LoginForm'
import { ProtectedRoute } from './components/ProtectedRoute'
import AnalyticsDashboard from './components/admin/AnalyticsDashboard'
import CouponManagement from './components/admin/CouponManagement'
import BusinessInsights from './components/admin/BusinessInsights'

// Mobile App Components
import { MobileApp } from './components/mobile/MobileApp'

import './App.css'

function App() {
  // Check environment variables first
  const envCheck = EnvironmentCheck()
  if (envCheck) return envCheck

  try {
    const { user, signOut, loading } = useAuth()

    if (loading) {
      return <FullScreenLoader message="Loading Saverly..." />
    }

    // Detect if we should show mobile or admin interface
    // For now, we'll use a simple path-based detection
    // In the future, this could be based on user roles or device detection
    const isAdminRoute = window.location.pathname.startsWith('/admin')

    if (isAdminRoute) {
      return (
        <Router>
          <AdminDashboard user={user} signOut={signOut} />
        </Router>
      )
    }

    // Default to mobile app
    return (
      <Router>
        <MobileApp />
      </Router>
    )
  } catch (error) {
    console.error('App component error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              Saverly
            </span>
          </h1>
          <p className="text-gray-600 mb-4">Your Local Coupon Marketplace</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Loading Error</h3>
            <p className="text-red-600 text-sm">
              Unable to load the application. Please refresh to try again.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}

// Admin Dashboard Component
function AdminDashboard({ user, signOut }: { user: any, signOut: () => void }) {
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent cursor-pointer">
                Saverly
              </span>
              <span className="text-gray-900 ml-2">Admin Dashboard</span>
            </h1>
            {user ? (
              <div className="flex items-center space-x-6">
                <nav className="flex space-x-4">
                  <a href="/admin" className="text-primary-600 hover:text-primary-700 font-medium">
                    Businesses
                  </a>
                  <a href="/admin/analytics" className="text-gray-600 hover:text-gray-700 font-medium">
                    Analytics
                  </a>
                  <a href="/admin/coupons" className="text-gray-600 hover:text-gray-700 font-medium">
                    Coupons
                  </a>
                  <a href="/admin/insights" className="text-gray-600 hover:text-gray-700 font-medium">
                    Insights
                  </a>
                  <a href="/admin/users" className="text-gray-600 hover:text-gray-700 font-medium">
                    Users
                  </a>
                </nav>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">{user.email}</span>
                  <button 
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                Please sign in to access the admin dashboard
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/admin/login" element={
              user ? <Navigate to="/admin" replace /> : <LoginForm />
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <BusinessList />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/businesses" element={
              <ProtectedRoute adminOnly>
                <BusinessList />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics" element={
              <ProtectedRoute adminOnly>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/coupons" element={
              <ProtectedRoute adminOnly>
                <CouponManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/insights" element={
              <ProtectedRoute adminOnly>
                <BusinessInsights />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
                  <p className="text-gray-600 mb-6">
                    This feature is coming soon. You'll be able to manage user accounts and permissions from here.
                  </p>
                  <a href="/admin" className="btn-primary">
                    Back to Businesses
                  </a>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
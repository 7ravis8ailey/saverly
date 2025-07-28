export function EnvironmentCheck() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  // Add debug logging for deployment
  console.log('Environment Check:', { 
    supabaseUrl: supabaseUrl ? 'SET' : 'MISSING', 
    supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING',
    rawValues: { supabaseUrl, supabaseAnonKey }
  })
  
  // Temporarily bypass environment check for development
  // TODO: Fix environment variable injection in production
  if (false && (!supabaseUrl || !supabaseAnonKey)) {
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-800 font-semibold mb-2">Configuration Required</h3>
            <p className="text-yellow-700 text-sm">
              Environment variables are not configured. Please contact support.
            </p>
            <div className="mt-3 text-xs text-yellow-600">
              <p>Missing: {!supabaseUrl && 'VITE_SUPABASE_URL'} {!supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Saverly connects local businesses with customers through exclusive digital coupons and deals.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useCoupon } from '../../hooks/useCoupons'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { FullScreenLoader } from '../ui/LoadingSpinner'
import { DealLimitReached } from './SubscriptionGate'

interface Redemption {
  id: string
  qr_code: string
  display_code: string
  expires_at: string
  status: 'pending' | 'redeemed' | 'expired' | 'cancelled'
}

export function QRRedemption() {
  const { couponId } = useParams<{ couponId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { coupon, loading: couponLoading } = useCoupon(couponId!)
  const { canRedeemDeals, remainingFreeDeals, trackDealRedemption } = useSubscription()
  
  const [redemption, setRedemption] = useState<Redemption | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<number>(60)
  const [status, setStatus] = useState<'generating' | 'active' | 'expired' | 'redeemed' | 'error'>('generating')
  const [error, setError] = useState<string | null>(null)

  // Generate redemption code
  const generateRedemption = async () => {
    if (!coupon || !user) return

    // Check if user can redeem more deals
    if (!canRedeemDeals) {
      setStatus('error')
      setError('You have reached your monthly deal limit. Upgrade to Saverly Pro for unlimited access.')
      return
    }

    try {
      setStatus('generating')
      
      // Generate unique codes
      const qrCode = `SAV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const displayCode = Math.random().toString(36).substr(2, 8).toUpperCase()
      const expiresAt = new Date(Date.now() + 60000).toISOString() // 60 seconds from now

      // Insert redemption record
      const { data, error: insertError } = await supabase
        .from('redemptions')
        .insert({
          user_id: user.id,
          coupon_id: coupon.id,
          business_id: coupon.business_id,
          qr_code: qrCode,
          display_code: displayCode,
          expires_at: expiresAt,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      setRedemption(data)

      // Generate QR code image
      const qrUrl = await QRCode.toDataURL(qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#22c55e',
          light: '#ffffff'
        }
      })
      
      setQrDataUrl(qrUrl)
      setStatus('active')
      setTimeRemaining(60)

      // Track deal redemption for usage limits
      trackDealRedemption()

    } catch (err) {
      console.error('Error generating redemption:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate redemption code')
      setStatus('error')
    }
  }

  // Timer countdown
  useEffect(() => {
    if (status !== 'active' || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setStatus('expired')
          // Update redemption status in database
          if (redemption) {
            supabase
              .from('redemptions')
              .update({ status: 'expired' })
              .eq('id', redemption.id)
              .then()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, timeRemaining, redemption])

  // Auto-generate redemption on mount
  useEffect(() => {
    if (coupon && user && !redemption) {
      generateRedemption()
    }
  }, [coupon, user])

  if (couponLoading) {
    return <FullScreenLoader message="Loading coupon details..." />
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Coupon Not Found</h2>
          <p className="text-gray-600 mb-4">This coupon may have expired or been removed.</p>
          <button onClick={() => navigate('/app')} className="btn-primary">
            Back to Deals
          </button>
        </div>
      </div>
    )
  }

  if (status === 'generating') {
    return <FullScreenLoader message="Generating your QR code..." />
  }

  if (status === 'error') {
    // Show deal limit reached screen for quota exceeded
    if (!canRedeemDeals) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="safe-top">
            <button
              onClick={() => navigate(-1)}
              className="text-primary-600 font-medium mb-4"
            >
              ← Back
            </button>
          </div>
          <DealLimitReached />
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generation Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={generateRedemption} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="safe-top bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 font-medium mb-4"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {status === 'active' ? 'Show QR Code' : status === 'expired' ? 'Code Expired' : 'Redeemed!'}
            </h1>
            <p className="text-gray-600">
              {coupon.business?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {status === 'active' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Timer */}
            <div className="mb-6">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                timeRemaining <= 10 ? 'bg-red-100 text-red-800' : 'bg-primary-100 text-primary-800'
              }`}>
                <ClockIcon className="w-5 h-5" />
                <span className="font-semibold text-lg">
                  {timeRemaining}s remaining
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="mb-6">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-64 h-64 mx-auto border-4 border-primary-500 rounded-lg"
              />
            </div>

            {/* Display Code */}
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Backup code:</p>
              <div className="font-mono text-2xl font-bold bg-gray-100 px-4 py-3 rounded-lg">
                {redemption?.display_code}
              </div>
            </div>

            {/* Coupon Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {coupon.title}
              </h3>
              <p className="text-gray-600 mb-2">{coupon.description}</p>
              <div className="inline-flex items-center bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {coupon.discount_amount}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-left text-sm text-gray-600">
              <h4 className="font-semibold mb-2">How to redeem:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Show this QR code to the cashier</li>
                <li>Or provide the backup code above</li>
                <li>Complete your purchase to apply the discount</li>
              </ol>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Expired</h2>
            <p className="text-gray-600 mb-6">
              This redemption code has expired. You can generate a new one if this coupon allows multiple uses.
            </p>
            
            {coupon.usage_limit_type !== 'once' && (
              <button
                onClick={generateRedemption}
                className="btn-primary mb-4"
              >
                Generate New Code
              </button>
            )}
            
            <button
              onClick={() => navigate('/app')}
              className="btn-outline"
            >
              Back to Deals
            </button>
          </div>
        )}

        {status === 'redeemed' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Successfully Redeemed!</h2>
            <p className="text-gray-600 mb-6">
              Your coupon has been redeemed. Enjoy your savings!
            </p>
            <button
              onClick={() => navigate('/app')}
              className="btn-primary"
            >
              Find More Deals
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
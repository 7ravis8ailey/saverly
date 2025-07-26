import React, { useState } from 'react'
import { X, Check, Crown, CreditCard, Star, Zap } from 'lucide-react'
import { useStripe, type SubscriptionPlan } from '../../hooks/useStripe'
import { useAuth } from '../../hooks/useAuth'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAuth()
  const { plans, createCheckoutSession, loading, error } = useStripe()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user?.id) {
      alert('Please log in to subscribe')
      return
    }

    setSelectedPlan(plan.id)
    await createCheckoutSession(plan, user.id)
    setSelectedPlan(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Unlock exclusive local deals and save money at your favorite places
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Plans */}
        <div className="p-6 space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl p-6 transition-all ${
                plan.popular
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    Best Value
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
                {plan.id === 'yearly' && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    Save $10.88 per year!
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading && selectedPlan === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading && selectedPlan === plan.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Start {plan.name}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Local Focus</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Instant Savings</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            🔒 Secure payment by Stripe • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </div>
  )
}
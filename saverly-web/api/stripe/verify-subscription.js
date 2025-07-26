// Stripe subscription verification endpoint (matching Replit implementation)
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required field: userId' 
      })
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status, subscription_plan, subscription_expires_at')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' })
    }

    // If no Stripe customer ID, user has no subscription
    if (!profile.stripe_customer_id) {
      return res.status(200).json({
        subscription_status: 'inactive',
        subscription_plan: null,
        expires_at: null
      })
    }

    // Get current subscription from Stripe
    let stripeSubscription = null
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all',
        limit: 1
      })

      if (subscriptions.data.length > 0) {
        stripeSubscription = subscriptions.data[0]
      }
    } catch (stripeError) {
      console.error('Stripe subscription retrieval error:', stripeError)
      // Continue with database data if Stripe fails
    }

    let subscriptionData = {
      subscription_status: profile.subscription_status || 'inactive',
      subscription_plan: profile.subscription_plan,
      expires_at: profile.subscription_expires_at
    }

    // If we have Stripe data, use it to update our records
    if (stripeSubscription) {
      const stripeStatus = stripeSubscription.status
      const planType = stripeSubscription.metadata?.plan_type || 
                     (stripeSubscription.items?.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly')
      
      const expiresAt = new Date(stripeSubscription.current_period_end * 1000).toISOString()

      subscriptionData = {
        subscription_status: stripeStatus,
        subscription_plan: planType,
        expires_at: expiresAt
      }

      // Update our database with current Stripe data
      try {
        await supabase
          .from('profiles')
          .update({
            subscription_status: stripeStatus,
            subscription_plan: planType,
            subscription_expires_at: expiresAt,
            stripe_subscription_id: stripeSubscription.id
          })
          .eq('id', userId)
      } catch (updateError) {
        console.error('Database update error:', updateError)
        // Don't fail the request if update fails
      }
    }

    res.status(200).json(subscriptionData)

  } catch (error) {
    console.error('Subscription verification error:', error)
    res.status(500).json({ 
      error: 'Failed to verify subscription',
      details: error.message 
    })
  }
}
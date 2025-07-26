// Stripe customer portal session creation endpoint (matching Replit implementation)
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
    const { customerId } = req.body

    // Validate required fields
    if (!customerId) {
      return res.status(400).json({ 
        error: 'Missing required field: customerId' 
      })
    }

    // Verify customer exists in Stripe
    let customer
    try {
      customer = await stripe.customers.retrieve(customerId)
      if (customer.deleted) {
        throw new Error('Customer has been deleted')
      }
    } catch (stripeError) {
      console.error('Stripe customer retrieval error:', stripeError)
      return res.status(404).json({ error: 'Customer not found' })
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin || 'http://localhost:5174'}/subscription/manage`,
    })

    // Log portal access for analytics (optional)
    try {
      if (customer.metadata?.supabase_user_id) {
        await supabase
          .from('analytics_events')
          .insert({
            user_id: customer.metadata.supabase_user_id,
            event_type: 'portal_access',
            event_data: {
              customer_id: customerId,
              portal_session_id: portalSession.id
            }
          })
      }
    } catch (analyticsError) {
      console.error('Analytics logging error:', analyticsError)
      // Don't fail the request if analytics logging fails
    }

    res.status(200).json({
      url: portalSession.url,
      sessionId: portalSession.id
    })

  } catch (error) {
    console.error('Stripe portal session creation error:', error)
    res.status(500).json({ 
      error: 'Failed to create portal session',
      details: error.message 
    })
  }
}
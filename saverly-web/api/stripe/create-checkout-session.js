// Stripe checkout session creation endpoint (matching Replit implementation)
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Price IDs - replace with your actual Stripe price IDs
const PRICE_IDS = {
  monthly: 'price_1234567890abcdef', // $4.99/month
  yearly: 'price_0987654321fedcba'   // $49/year
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { planType, userFromFrontend } = req.body

    // Validate required fields
    if (!planType || !userFromFrontend?.id || !userFromFrontend?.email) {
      return res.status(400).json({ 
        error: 'Missing required fields: planType, userFromFrontend.id, userFromFrontend.email' 
      })
    }

    // Validate plan type
    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type' })
    }

    // Get or create Stripe customer
    let customer
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: userFromFrontend.email,
        limit: 1
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: userFromFrontend.email,
          name: userFromFrontend.full_name,
          metadata: {
            supabase_user_id: userFromFrontend.id
          }
        })
      }
    } catch (stripeError) {
      console.error('Stripe customer error:', stripeError)
      return res.status(500).json({ error: 'Failed to create or retrieve customer' })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[planType],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:5174'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5174'}/subscription/canceled`,
      metadata: {
        supabase_user_id: userFromFrontend.id,
        plan_type: planType
      },
      subscription_data: {
        metadata: {
          supabase_user_id: userFromFrontend.id,
          plan_type: planType
        }
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect tax automatically
      automatic_tax: {
        enabled: true,
      },
      // Customer update options
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    })

    // Store checkout session info in Supabase for reference
    try {
      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customer.id,
          last_checkout_session_id: session.id
        })
        .eq('id', userFromFrontend.id)
    } catch (supabaseError) {
      console.error('Supabase update error:', supabaseError)
      // Don't fail the request if this update fails
    }

    res.status(200).json({
      sessionUrl: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Stripe checkout session creation error:', error)
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    })
  }
}
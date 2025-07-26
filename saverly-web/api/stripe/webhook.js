// Stripe webhook handler for subscription events (matching Replit implementation)
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id)
  
  const userId = session.metadata?.supabase_user_id
  if (!userId) {
    console.error('No supabase_user_id in session metadata')
    return
  }

  // Update user profile with successful checkout
  await supabase
    .from('profiles')
    .update({
      stripe_customer_id: session.customer,
      subscription_status: 'active',
      subscription_plan: session.metadata?.plan_type || 'monthly',
      last_payment_date: new Date().toISOString()
    })
    .eq('id', userId)

  // Log successful conversion
  await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_created',
      event_data: {
        customer_id: session.customer,
        session_id: session.id,
        plan_type: session.metadata?.plan_type,
        amount_total: session.amount_total
      }
    })
}

async function handleSubscriptionChange(subscription) {
  console.log('Subscription changed:', subscription.id)
  
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) {
    // Try to find user by customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single()
    
    if (!profile) {
      console.error('Could not find user for subscription:', subscription.id)
      return
    }
    userId = profile.id
  }

  const planType = subscription.metadata?.plan_type || 
                  (subscription.items?.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly')

  // Update subscription status
  await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_plan: planType,
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id
    })
    .eq('id', userId)

  // Log subscription change
  await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_updated',
      event_data: {
        subscription_id: subscription.id,
        status: subscription.status,
        plan_type: planType,
        current_period_end: subscription.current_period_end
      }
    })
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) {
    // Try to find user by customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single()
    
    if (!profile) {
      console.error('Could not find user for deleted subscription:', subscription.id)
      return
    }
    userId = profile.id
  }

  // Update subscription status to canceled
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_expires_at: new Date(subscription.ended_at * 1000).toISOString()
    })
    .eq('id', userId)

  // Log subscription cancellation
  await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_canceled',
      event_data: {
        subscription_id: subscription.id,
        ended_at: subscription.ended_at,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    })
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id)
  
  if (invoice.subscription) {
    // Get subscription to find user
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const userId = subscription.metadata?.supabase_user_id
    
    if (!userId) {
      // Try to find user by customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single()
      
      if (!profile) return
      userId = profile.id
    }

    // Update last payment date
    await supabase
      .from('profiles')
      .update({
        last_payment_date: new Date().toISOString(),
        subscription_status: subscription.status
      })
      .eq('id', userId)

    // Log successful payment
    await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: 'payment_succeeded',
        event_data: {
          invoice_id: invoice.id,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency
        }
      })
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id)
  
  if (invoice.subscription) {
    // Get subscription to find user
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const userId = subscription.metadata?.supabase_user_id
    
    if (!userId) {
      // Try to find user by customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single()
      
      if (!profile) return
      userId = profile.id
    }

    // Update subscription status to past_due
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'past_due'
      })
      .eq('id', userId)

    // Log payment failure
    await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: 'payment_failed',
        event_data: {
          invoice_id: invoice.id,
          amount_due: invoice.amount_due,
          currency: invoice.currency,
          next_payment_attempt: invoice.next_payment_attempt
        }
      })
  }
}

// For Vercel, we need to export the config to handle raw body
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
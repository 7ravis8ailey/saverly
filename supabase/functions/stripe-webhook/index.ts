import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
    )

    console.log(`🔔 Webhook received: ${event.type}`)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Map Stripe status to our internal status
        const statusMap: Record<string, 'active' | 'inactive'> = {
          'active': 'active',
          'trialing': 'active',
          'past_due': 'inactive',
          'unpaid': 'inactive',
          'canceled': 'inactive',
          'incomplete': 'inactive',
          'incomplete_expired': 'inactive'
        }
        
        const internalStatus = statusMap[subscription.status] || 'inactive'
        
        console.log(`Updating subscription for customer: ${subscription.customer}`)
        
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: internalStatus,
            subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            subscription_plan: subscription.items.data[0]?.price?.recurring?.interval || 'monthly'
          })
          .eq('stripe_customer_id', subscription.customer as string)
        
        if (error) {
          console.error('Error updating subscription:', error)
          return new Response('Database error', { status: 500 })
        }
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log(`Canceling subscription for customer: ${subscription.customer}`)
        
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'inactive',
            subscription_period_end: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string)
        
        if (error) {
          console.error('Error canceling subscription:', error)
          return new Response('Database error', { status: 500 })
        }
        
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 400 })
  }
})
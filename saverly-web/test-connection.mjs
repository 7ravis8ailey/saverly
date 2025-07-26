import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lziayzusujlvhebyagdl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aWF5enVzdWpsdmhlYnlhZ2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODU5NjUsImV4cCI6MjA2OTA2MTk2NX0.zghVA_8Gijpk2L8iC5bRhD8SIrW6GmPJp-Q39ykYszc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔗 Testing Supabase connection...')
  
  // Test connection
  const { data: testData, error: testError } = await supabase
    .from('businesses')
    .select('count')
    .limit(1)
  
  if (testError) {
    console.error('❌ Connection failed:', testError.message)
    return
  }
  
  console.log('✅ Connected to Supabase!')
  
  // Add sample businesses
  console.log('📝 Adding sample businesses...')
  
  const businesses = [
    {
      name: 'The Coffee Corner',
      description: 'Local coffee shop with fresh pastries and artisan coffee',
      category: 'Food & Beverage',
      address: '123 Main St',
      city: 'Kingsport',
      state: 'TN',
      zip_code: '37660',
      latitude: 36.5481,
      longitude: -82.5618,
      phone: '(423) 555-0101',
      email: 'info@coffeecorner.com',
      contact_name: 'Sarah Johnson',
      active: true
    },
    {
      name: 'Mountain View Diner',
      description: 'Family-owned diner serving comfort food since 1985',
      category: 'Food & Beverage',
      address: '456 Oak Ave',
      city: 'Bristol',
      state: 'TN',
      zip_code: '37620',
      latitude: 36.5951,
      longitude: -82.1887,
      phone: '(423) 555-0102',
      email: 'contact@mountainviewdiner.com',
      contact_name: 'Mike Thompson',
      active: true
    },
    {
      name: 'Appalachian Outfitters',
      description: 'Outdoor gear and equipment for hiking and camping',
      category: 'Retail',
      address: '789 Pine St',
      city: 'Johnson City',
      state: 'TN',
      zip_code: '37601',
      latitude: 36.3134,
      longitude: -82.3535,
      phone: '(423) 555-0103',
      email: 'sales@appoutfitters.com',
      contact_name: 'Jennifer Davis',
      active: true
    },
    {
      name: 'Healing Hands Spa',
      description: 'Full-service spa offering massages and wellness treatments',
      category: 'Health & Wellness',
      address: '321 Elm Dr',
      city: 'Elizabethton',
      state: 'TN',
      zip_code: '37643',
      latitude: 36.3489,
      longitude: -82.2107,
      phone: '(423) 555-0104',
      email: 'bookings@healinghands.com',
      contact_name: 'Amanda Rodriguez',
      active: true
    }
  ]
  
  const { data: insertedBusinesses, error: businessError } = await supabase
    .from('businesses')
    .insert(businesses)
    .select()
  
  if (businessError) {
    console.error('❌ Error adding businesses:', businessError.message)
    return
  }
  
  console.log(`✅ Added ${insertedBusinesses.length} businesses`)
  
  // Add sample coupons
  console.log('🎫 Adding sample coupons...')
  
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
  
  const coupons = [
    {
      business_id: insertedBusinesses[0].id,
      title: 'Free Pastry with Coffee',
      description: 'Get a free pastry when you purchase any large coffee drink',
      discount_amount: 'Free pastry (up to $4 value)',
      terms: 'One per customer per visit. Cannot be combined with other offers.',
      usage_limit_type: 'daily',
      start_date: new Date().toISOString(),
      end_date: thirtyDaysFromNow,
      active: true
    },
    {
      business_id: insertedBusinesses[0].id,
      title: '20% Off Coffee Beans',
      description: 'Save 20% on any bag of our artisan coffee beans',
      discount_amount: '20% off',
      terms: 'Excludes already discounted items. Valid on retail bags only.',
      usage_limit_type: 'monthly_2',
      start_date: new Date().toISOString(),
      end_date: sixtyDaysFromNow,
      active: true
    },
    {
      business_id: insertedBusinesses[1].id,
      title: '$5 Off Dinner Special',
      description: 'Save $5 on any dinner entrée over $15',
      discount_amount: '$5 off',
      terms: 'Valid after 4 PM only. Cannot be used with other promotions.',
      usage_limit_type: 'once',
      start_date: new Date().toISOString(),
      end_date: sixtyDaysFromNow,
      active: true
    },
    {
      business_id: insertedBusinesses[2].id,
      title: '15% Off Hiking Gear',
      description: 'Get 15% off all hiking boots, backpacks, and outdoor apparel',
      discount_amount: '15% off',
      terms: 'Excludes sale items and gift cards. Minimum purchase $50.',
      usage_limit_type: 'monthly_1',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    }
  ]
  
  const { data: insertedCoupons, error: couponError } = await supabase
    .from('coupons')
    .insert(coupons)
    .select()
  
  if (couponError) {
    console.error('❌ Error adding coupons:', couponError.message)
    return
  }
  
  console.log(`✅ Added ${insertedCoupons.length} coupons`)
  
  console.log('🎉 Sample data setup complete!')
  console.log('🌐 Your web app is ready at: http://localhost:5174/')
  console.log('📊 Database contains:')
  console.log(`   - ${insertedBusinesses.length} businesses`)
  console.log(`   - ${insertedCoupons.length} coupons`)
}

main().catch(console.error)
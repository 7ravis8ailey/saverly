# 🗄️ Supabase Database Setup Instructions

## Quick Setup (Copy & Paste)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/lziayzusujlvhebyagdl
2. **Navigate to**: SQL Editor → New Query
3. **Copy the entire contents** of `saverly-web/supabase/schema.sql`
4. **Paste and Run** the SQL script
5. **Done!** Your optimized database is ready

## 🚀 What This Schema Includes

### **Optimized Tables:**
- ✅ `profiles` - Enhanced user data with subscription tracking
- ✅ `businesses` - Complete business info with geolocation  
- ✅ `coupons` - Flexible discount system with usage limits
- ✅ `redemptions` - QR-based redemption with analytics
- ✅ `user_favorites` - User favorite businesses (NEW)
- ✅ `analytics_events` - User behavior tracking (NEW)

### **Performance Features:**
- ✅ **Optimized ENUM types** instead of text constraints
- ✅ **Strategic indexes** for fast location-based queries
- ✅ **Automatic triggers** for business metrics updates  
- ✅ **Row Level Security** with proper policies
- ✅ **Sample data** included for immediate testing

### **Key Improvements Over Replit Version:**
1. **Better Data Types**: ENUMs for consistency, proper decimal precision
2. **Enhanced Geolocation**: Optimized for distance calculations
3. **Automatic Metrics**: Business stats update automatically
4. **Flexible Discounts**: Support for percentage, fixed, BOGO, free items
5. **Advanced Analytics**: Built-in user behavior tracking
6. **Favorites System**: User can save favorite businesses
7. **Security**: Comprehensive RLS policies with admin controls

## 🔧 After Running the Schema

### 1. Update Admin Emails
In the SQL script, replace the admin emails:
```sql
-- Find this line and replace with your admin email:
AND profiles.email IN ('admin@saverly.app', 'your-email@example.com')
```

### 2. Test the Connection
The schema includes sample data:
- 5 sample businesses in Northeast TN
- 5 sample coupons with different discount types
- All properly geolocated with real coordinates

### 3. Verify Setup
Run this query to confirm everything works:
```sql
SELECT 
    b.name,
    c.title,
    c.discount_type,
    c.discount_value
FROM businesses b 
JOIN coupons c ON b.id = c.business_id 
WHERE b.is_active = true;
```

## 📊 Schema Highlights

### **User Profiles**
```sql
subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
subscription_plan: 'monthly' | 'yearly'  
stripe_customer_id: Unique Stripe customer tracking
location: Latitude/longitude for distance calculations
```

### **Business Categories**
```sql
'restaurant' | 'retail' | 'service' | 'entertainment' | 
'health' | 'beauty' | 'automotive' | 'other'
```

### **Discount Types**
```sql
'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_item'
```

### **Usage Limits**
```sql
'once' | 'daily' | 'weekly' | 'monthly' | 'unlimited'
```

## 🎯 Ready for Production

This schema is production-ready with:
- **Security**: RLS policies protect user data
- **Performance**: Optimized indexes for fast queries
- **Scalability**: Efficient data types and constraints
- **Analytics**: Built-in tracking for business insights
- **Flexibility**: Supports complex discount scenarios

Your Saverly app will now have real data flowing through all components!
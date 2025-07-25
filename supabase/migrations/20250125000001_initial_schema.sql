-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location data
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_period_start TIMESTAMPTZ,
  subscription_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'Food & Beverage',
    'Retail', 
    'Health & Wellness',
    'Entertainment & Recreation',
    'Personal Services'
  )),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  logo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_amount TEXT NOT NULL,
  terms TEXT,
  usage_limit_type TEXT DEFAULT 'once' CHECK (usage_limit_type IN (
    'once', 'daily', 'monthly_1', 'monthly_2', 'monthly_4'
  )),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create redemptions table
CREATE TABLE public.redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  coupon_id UUID REFERENCES coupons(id) NOT NULL,
  business_id UUID REFERENCES businesses(id) NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  display_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired', 'cancelled')),
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX profiles_subscription_status_idx ON profiles(subscription_status);
CREATE INDEX profiles_location_idx ON profiles(latitude, longitude);

CREATE INDEX businesses_location_idx ON businesses(latitude, longitude);
CREATE INDEX businesses_active_idx ON businesses(active);
CREATE INDEX businesses_category_idx ON businesses(category);

CREATE INDEX coupons_business_active_idx ON coupons(business_id, active);
CREATE INDEX coupons_date_idx ON coupons(start_date, end_date);
CREATE INDEX coupons_location_lookup_idx ON coupons(business_id, active, start_date, end_date);

CREATE INDEX redemptions_user_idx ON redemptions(user_id);
CREATE INDEX redemptions_status_idx ON redemptions(status);
CREATE INDEX redemptions_coupon_idx ON redemptions(coupon_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses: Public read for active businesses
CREATE POLICY "Anyone can view active businesses" ON businesses
  FOR SELECT USING (active = true);

-- Coupons: Public read for active, non-expired coupons
CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (
    active = true 
    AND start_date <= NOW() 
    AND end_date >= NOW()
  );

-- Redemptions: Users can see their own, can create their own
CREATE POLICY "Users can view their own redemptions" ON redemptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own redemptions" ON redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
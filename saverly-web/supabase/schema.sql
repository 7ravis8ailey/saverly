-- =====================================================
-- Saverly Optimized Database Schema for Supabase
-- Based on Replit version but enhanced for performance
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CREATE OPTIMIZED ENUM TYPES
-- =====================================================

-- Create ENUM types for better performance and consistency
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'past_due', 'canceled', 'trialing');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE business_category AS ENUM ('restaurant', 'retail', 'service', 'entertainment', 'health', 'beauty', 'automotive', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'buy_one_get_one', 'free_item');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE usage_limit_type AS ENUM ('once', 'daily', 'weekly', 'monthly', 'unlimited');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE redemption_status AS ENUM ('pending', 'redeemed', 'expired', 'canceled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =====================================================
-- CREATE OPTIMIZED TABLES
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    
    -- Address information
    street_address TEXT,
    city TEXT,
    state TEXT DEFAULT 'TN',
    zip_code TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Subscription management
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_plan subscription_plan,
    
    -- Stripe integration
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    
    -- Subscription tracking
    subscription_started_at TIMESTAMPTZ,
    subscription_expires_at TIMESTAMPTZ,
    
    -- User preferences
    push_notifications_enabled BOOLEAN DEFAULT true,
    location_sharing_enabled BOOLEAN DEFAULT true,
    marketing_emails_enabled BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- Businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic business information
    name TEXT NOT NULL,
    description TEXT,
    category business_category NOT NULL DEFAULT 'other',
    
    -- Contact information
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    contact_name TEXT NOT NULL,
    
    -- Address information
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'TN',
    zip_code TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    
    -- Business media
    logo_url TEXT,
    banner_url TEXT,
    
    -- Business settings
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    accepts_reservations BOOLEAN DEFAULT false,
    
    -- Operating hours (JSON for flexibility)
    operating_hours JSONB DEFAULT '{}',
    
    -- Business metrics
    total_coupons INTEGER DEFAULT 0,
    total_redemptions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_business_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://'),
    CONSTRAINT valid_rating CHECK (average_rating >= 0.0 AND average_rating <= 5.0),
    CONSTRAINT valid_coordinates CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180),
    CONSTRAINT valid_metrics CHECK (total_coupons >= 0 AND total_redemptions >= 0)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- Coupon content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    terms_conditions TEXT,
    
    -- Discount configuration
    discount_type discount_type NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_purchase DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount DECIMAL(10,2),
    
    -- Usage limits
    usage_limit_type usage_limit_type DEFAULT 'once',
    max_uses_per_user INTEGER DEFAULT 1,
    max_total_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    
    -- Time restrictions
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    
    -- Availability settings
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    requires_subscription BOOLEAN DEFAULT true,
    
    -- Coupon metadata
    tags TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 0,
    
    -- Performance tracking
    view_count INTEGER DEFAULT 0,
    redemption_count INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_discount_value CHECK (discount_value > 0),
    CONSTRAINT valid_minimum_purchase CHECK (minimum_purchase >= 0),
    CONSTRAINT valid_date_range CHECK (valid_until > valid_from),
    CONSTRAINT valid_usage_counts CHECK (
        current_uses >= 0 AND 
        (max_total_uses IS NULL OR current_uses <= max_total_uses) AND
        max_uses_per_user > 0
    )
);

-- Redemptions table
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Foreign key relationships
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    
    -- QR code system
    qr_code TEXT UNIQUE NOT NULL,
    display_code TEXT UNIQUE NOT NULL,
    verification_code TEXT UNIQUE,
    
    -- Redemption tracking
    status redemption_status DEFAULT 'pending',
    
    -- Timestamps
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    redeemed_at TIMESTAMPTZ,
    
    -- Location tracking
    redemption_latitude DECIMAL(10,8),
    redemption_longitude DECIMAL(11,8),
    
    -- Value tracking
    discount_amount DECIMAL(10,2),
    original_value DECIMAL(10,2),
    
    -- Metadata
    user_agent TEXT,
    ip_address INET,
    device_info JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_expiration CHECK (expires_at > generated_at),
    CONSTRAINT valid_redemption_time CHECK (redeemed_at IS NULL OR redeemed_at <= expires_at),
    CONSTRAINT valid_amounts CHECK (
        (discount_amount IS NULL OR discount_amount >= 0) AND 
        (original_value IS NULL OR original_value >= 0)
    ),
    CONSTRAINT valid_redemption_coords CHECK (
        (redemption_latitude IS NULL AND redemption_longitude IS NULL) OR 
        (redemption_latitude BETWEEN -90 AND 90 AND redemption_longitude BETWEEN -180 AND 180)
    )
);

-- User favorites table (new optimization)
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate favorites
    UNIQUE(user_id, business_id)
);

-- Analytics tracking table (new for insights)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id UUID,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for efficient queries
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'coupon_view', 'coupon_redeem', 'business_view', 'search', 
        'subscription_start', 'subscription_cancel', 'app_open', 'app_close'
    ))
);

-- =====================================================
-- CREATE PERFORMANCE INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Businesses indexes
CREATE INDEX IF NOT EXISTS businesses_location_idx ON businesses(latitude, longitude);
CREATE INDEX IF NOT EXISTS businesses_active_idx ON businesses(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS businesses_category_idx ON businesses(category);
CREATE INDEX IF NOT EXISTS businesses_city_state_idx ON businesses(city, state);

-- Coupons indexes
CREATE INDEX IF NOT EXISTS coupons_business_active_idx ON coupons(business_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS coupons_date_range_idx ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS coupons_featured_idx ON coupons(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS coupons_subscription_idx ON coupons(requires_subscription);
CREATE INDEX IF NOT EXISTS coupons_priority_idx ON coupons(priority DESC);

-- Redemptions indexes
CREATE INDEX IF NOT EXISTS redemptions_user_idx ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS redemptions_coupon_idx ON redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS redemptions_business_idx ON redemptions(business_id);
CREATE INDEX IF NOT EXISTS redemptions_status_idx ON redemptions(status);
CREATE INDEX IF NOT EXISTS redemptions_qr_code_idx ON redemptions(qr_code);
CREATE INDEX IF NOT EXISTS redemptions_expires_idx ON redemptions(expires_at);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS user_favorites_user_idx ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS user_favorites_business_idx ON user_favorites(business_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS analytics_user_event_idx ON analytics_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at);

-- =====================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redemptions_updated_at BEFORE UPDATE ON redemptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update business metrics when coupons change
CREATE OR REPLACE FUNCTION update_business_coupon_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE businesses 
        SET total_coupons = total_coupons + 1 
        WHERE id = NEW.business_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE businesses 
        SET total_coupons = total_coupons - 1 
        WHERE id = OLD.business_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for business coupon count
CREATE TRIGGER update_business_coupon_count_trigger
    AFTER INSERT OR DELETE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_business_coupon_count();

-- Function to update business redemption count
CREATE OR REPLACE FUNCTION update_business_redemption_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'redeemed' AND OLD.status != 'redeemed' THEN
        UPDATE businesses 
        SET total_redemptions = total_redemptions + 1 
        WHERE id = NEW.business_id;
        
        UPDATE coupons 
        SET redemption_count = redemption_count + 1,
            current_uses = current_uses + 1
        WHERE id = NEW.coupon_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for redemption count
CREATE TRIGGER update_redemption_count_trigger
    AFTER UPDATE ON redemptions
    FOR EACH ROW EXECUTE FUNCTION update_business_redemption_count();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses policies (public read for active businesses)
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (is_active = true);

-- Admin policy for businesses (you'll need to add admin role check)
CREATE POLICY "Admins can manage businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email IN ('admin@saverly.app', 'travis@example.com') -- Replace with actual admin emails
        )
    );

-- Coupons policies (public read for active coupons)
CREATE POLICY "Anyone can view active coupons" ON coupons
    FOR SELECT USING (
        is_active = true 
        AND valid_from <= NOW() 
        AND valid_until >= NOW()
    );

-- Admin policy for coupons
CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email IN ('admin@saverly.app', 'travis@example.com') -- Replace with actual admin emails
        )
    );

-- Redemptions policies
CREATE POLICY "Users can view their own redemptions" ON redemptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions" ON redemptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own redemptions" ON redemptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions" ON redemptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email IN ('admin@saverly.app', 'travis@example.com') -- Replace with actual admin emails
        )
    );

-- User favorites policies
CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can create their own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics events" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email IN ('admin@saverly.app', 'travis@example.com') -- Replace with actual admin emails
        )
    );

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample businesses for testing
INSERT INTO public.businesses (name, description, category, email, phone, contact_name, street_address, city, state, zip_code, latitude, longitude) VALUES
('Mountain Coffee Roasters', 'Artisanal coffee roasted daily in the heart of Northeast TN', 'restaurant', 'info@mountaincoffee.com', '+1-423-555-0101', 'Sarah Johnson', '123 Main St', 'Johnson City', 'TN', '37601', 36.3134, -82.3535),
('Smoky Mountain Grill', 'Farm-to-table dining with stunning mountain views', 'restaurant', 'hello@smokymountaingrill.com', '+1-423-555-0102', 'Mike Davidson', '456 Scenic Dr', 'Gatlinburg', 'TN', '37738', 35.7143, -83.5102),
('Appalachian Outfitters', 'Your complete outdoor gear and adventure store', 'retail', 'gear@appalachianoutfitters.com', '+1-423-555-0103', 'Lisa Chen', '789 Adventure Ave', 'Kingsport', 'TN', '37660', 36.5485, -82.5618),
('East Tennessee Auto Care', 'Complete automotive service and repair', 'automotive', 'service@etnautocare.com', '+1-423-555-0104', 'Robert Miller', '321 Service Rd', 'Bristol', 'TN', '37620', 36.5951, -82.1887),
('Wellness Spa & Retreat', 'Relaxation and rejuvenation in the mountains', 'beauty', 'book@wellnessretreat.com', '+1-423-555-0105', 'Amanda White', '654 Tranquil Ln', 'Pigeon Forge', 'TN', '37863', 35.7884, -83.5541)
ON CONFLICT DO NOTHING;

-- Sample coupons for testing
INSERT INTO public.coupons (business_id, title, description, discount_type, discount_value, valid_from, valid_until, terms_conditions) 
SELECT 
    b.id,
    CASE 
        WHEN b.name = 'Mountain Coffee Roasters' THEN '20% Off Premium Coffee'
        WHEN b.name = 'Smoky Mountain Grill' THEN '$10 Off Dinner for Two'
        WHEN b.name = 'Appalachian Outfitters' THEN '15% Off Hiking Gear'
        WHEN b.name = 'East Tennessee Auto Care' THEN 'Free Oil Change'
        WHEN b.name = 'Wellness Spa & Retreat' THEN '25% Off First Massage'
    END,
    CASE 
        WHEN b.name = 'Mountain Coffee Roasters' THEN 'Get 20% off any premium coffee blend or single-origin coffee'
        WHEN b.name = 'Smoky Mountain Grill' THEN 'Save $10 on any dinner for two people. Minimum purchase $40.'
        WHEN b.name = 'Appalachian Outfitters' THEN 'Save 15% on all hiking boots, backpacks, and camping gear'
        WHEN b.name = 'East Tennessee Auto Care' THEN 'Complimentary oil change with any service over $50'
        WHEN b.name = 'Wellness Spa & Retreat' THEN 'New customers save 25% on their first hour-long massage'
    END,
    CASE 
        WHEN b.name IN ('Mountain Coffee Roasters', 'Appalachian Outfitters', 'Wellness Spa & Retreat') THEN 'percentage'
        ELSE 'fixed_amount'
    END::discount_type,
    CASE 
        WHEN b.name = 'Mountain Coffee Roasters' THEN 20.00
        WHEN b.name = 'Smoky Mountain Grill' THEN 10.00
        WHEN b.name = 'Appalachian Outfitters' THEN 15.00
        WHEN b.name = 'East Tennessee Auto Care' THEN 25.00
        WHEN b.name = 'Wellness Spa & Retreat' THEN 25.00
    END,
    NOW(),
    NOW() + INTERVAL '30 days',
    'Cannot be combined with other offers. One coupon per customer.'
FROM businesses b
ON CONFLICT DO NOTHING;

-- =====================================================
-- FINAL OPTIMIZATIONS
-- =====================================================

-- Analyze tables for query optimization
ANALYZE profiles;
ANALYZE businesses;
ANALYZE coupons;
ANALYZE redemptions;
ANALYZE user_favorites;
ANALYZE analytics_events;

-- Add helpful comments
COMMENT ON TABLE profiles IS 'Extended user profiles with subscription and location data';
COMMENT ON TABLE businesses IS 'Local businesses offering coupons through Saverly';
COMMENT ON TABLE coupons IS 'Digital coupons with flexible discount types and usage limits';
COMMENT ON TABLE redemptions IS 'QR-based coupon redemption tracking with analytics';
COMMENT ON TABLE user_favorites IS 'User favorite businesses for personalized experience';
COMMENT ON TABLE analytics_events IS 'User behavior tracking for business insights';

-- Schema creation complete
SELECT 'Saverly optimized database schema created successfully!' as result;
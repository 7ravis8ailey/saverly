-- Security improvements and RBAC implementation
-- This migration adds comprehensive security features to the Saverly database

-- Add user roles and admin system
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin'));
ALTER TABLE profiles ADD COLUMN business_id UUID REFERENCES businesses(id);
ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN created_by UUID REFERENCES profiles(id);

-- Add business ownership and verification
ALTER TABLE businesses ADD COLUMN owner_id UUID REFERENCES profiles(id);
ALTER TABLE businesses ADD COLUMN verified BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN verification_date TIMESTAMPTZ;

-- Add better constraints to businesses table
ALTER TABLE businesses ADD CONSTRAINT businesses_name_unique UNIQUE (name);
ALTER TABLE businesses ADD CONSTRAINT businesses_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE businesses ADD CONSTRAINT businesses_phone_check CHECK (phone IS NULL OR phone ~ '^\(\d{3}\) \d{3}-\d{4}$');
ALTER TABLE businesses ADD CONSTRAINT businesses_zip_check CHECK (zip_code ~ '^\d{5}(-\d{4})?$');
ALTER TABLE businesses ADD CONSTRAINT businesses_lat_check CHECK (latitude >= -90 AND latitude <= 90);
ALTER TABLE businesses ADD CONSTRAINT businesses_lng_check CHECK (longitude >= -180 AND longitude <= 180);

-- Add audit fields to all tables
ALTER TABLE businesses ADD COLUMN modified_by UUID REFERENCES profiles(id);
ALTER TABLE coupons ADD COLUMN created_by UUID REFERENCES profiles(id);
ALTER TABLE coupons ADD COLUMN modified_by UUID REFERENCES profiles(id);

-- Add coupon business logic constraints
ALTER TABLE coupons ADD CONSTRAINT coupons_dates_check CHECK (end_date > start_date);
ALTER TABLE coupons ADD CONSTRAINT coupons_start_date_check CHECK (start_date >= CURRENT_DATE);

-- Add redemption security
ALTER TABLE redemptions ADD COLUMN ip_address INET;
ALTER TABLE redemptions ADD COLUMN user_agent TEXT;
ALTER TABLE redemptions ADD CONSTRAINT redemptions_unique_per_user_coupon UNIQUE (user_id, coupon_id, DATE(created_at));

-- Create audit log table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX audit_logs_table_record_idx ON audit_logs(table_name, record_id);
CREATE INDEX audit_logs_user_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);

-- Update RLS policies for enhanced security

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;

-- Businesses: Only admins can manage, others can view active businesses
CREATE POLICY "Admins can manage all businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Business owners can manage their businesses" ON businesses
    FOR ALL USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.business_id = businesses.id
            AND profiles.role = 'business_owner'
        )
    );

CREATE POLICY "Anyone can view verified active businesses" ON businesses
    FOR SELECT USING (active = true AND verified = true);

-- Coupons: Business owners and admins can manage, users can view active ones
CREATE POLICY "Admins can manage all coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Business owners can manage their coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM businesses b
            JOIN profiles p ON (b.owner_id = p.id OR p.business_id = b.id)
            WHERE b.id = coupons.business_id
            AND p.id = auth.uid()
            AND p.role IN ('business_owner', 'admin')
        )
    );

CREATE POLICY "Users can view active valid coupons" ON coupons
    FOR SELECT USING (
        active = true 
        AND start_date <= NOW() 
        AND end_date >= NOW()
        AND EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = coupons.business_id 
            AND businesses.active = true 
            AND businesses.verified = true
        )
    );

-- Profiles: Enhanced security
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = OLD.role  -- Users cannot change their own role
    );

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id 
        AND role = 'user'  -- New users default to 'user' role
    );

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles admin_profile
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'admin'
        )
    );

-- Redemptions: Enhanced policies
DROP POLICY IF EXISTS "Users can view their own redemptions" ON redemptions;
DROP POLICY IF EXISTS "Users can create their own redemptions" ON redemptions;

CREATE POLICY "Users can view their own redemptions" ON redemptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions" ON redemptions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.subscription_status = 'active'
        )
    );

CREATE POLICY "Business owners can view their redemptions" ON redemptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses b
            JOIN profiles p ON (b.owner_id = p.id OR p.business_id = b.id)
            WHERE b.id = redemptions.business_id
            AND p.id = auth.uid()
            AND p.role IN ('business_owner', 'admin')
        )
    );

CREATE POLICY "Admins can manage all redemptions" ON redemptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Audit logs: Only admins can view
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to all main tables
CREATE TRIGGER businesses_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON businesses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER coupons_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON coupons
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER redemptions_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON redemptions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Update profile creation function to handle new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        role, 
        email_verified, 
        created_at
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
        NEW.email,
        'user',
        NEW.email_confirmed_at IS NOT NULL,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Delete expired redemptions older than 30 days
    DELETE FROM redemptions 
    WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '30 days';
    
    -- Delete old audit logs (keep 1 year)
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Archive old coupons (mark as inactive if expired for 7 days)
    UPDATE coupons 
    SET active = false 
    WHERE active = true 
    AND end_date < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_business_id_idx ON profiles(business_id);
CREATE INDEX businesses_owner_id_idx ON businesses(owner_id);
CREATE INDEX businesses_verified_active_idx ON businesses(verified, active);
CREATE INDEX coupons_business_dates_idx ON coupons(business_id, start_date, end_date) WHERE active = true;
CREATE INDEX redemptions_business_date_idx ON redemptions(business_id, created_at);

-- Add comment documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all data modifications';
COMMENT ON COLUMN profiles.role IS 'User role: user, business_owner, or admin';
COMMENT ON COLUMN businesses.verified IS 'Whether business has been verified by admin';
COMMENT ON FUNCTION cleanup_expired_data() IS 'Maintenance function to cleanup old data - should be run daily';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_data() TO service_role;
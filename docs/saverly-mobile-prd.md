# Saverly Mobile App - Product Requirements Document (PRD)

## Executive Summary
Saverly is a location-based digital coupon mobile application connecting local businesses in Northeast TN with cost-conscious consumers through a subscription model ($4.99/month). This PRD outlines the development of a React Native mobile app with Supabase backend, migrating from existing Replit/PostgreSQL codebase.

## 📱 Mobile-First Strategy

### Target Platforms
- **Primary**: iOS and Android native apps via React Native
- **Secondary**: Web app for admin dashboard (React web)
- **Future**: PWA for broader accessibility

### Why React Native
- Single codebase for iOS/Android
- Native performance for location services
- Push notifications support
- Camera integration for QR scanning
- Native UI components
- Easy deployment to app stores

## 🏗️ Architecture Overview

### Frontend Stack
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation v6
- **State Management**: Zustand or Redux Toolkit
- **UI Library**: React Native Elements + custom components
- **Maps**: React Native Maps (Google Maps)
- **QR Code**: react-native-qrcode-scanner
- **Push Notifications**: Expo Notifications
- **Location**: Expo Location

### Backend Stack
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for business logos, QR codes)
- **Real-time**: Supabase Realtime subscriptions
- **Edge Functions**: Stripe webhook handling

### Deployment Strategy
- **Mobile Apps**: Expo Application Services (EAS) → App Store & Google Play
- **Admin Web Dashboard**: Netlify (React SPA)
- **Backend**: Supabase (hosted)
- **Static Assets**: Supabase Storage or Netlify

## 🔑 API Key Migration Strategy

### From Base44 to New App
1. **Stripe Integration**
   - Extract Stripe publishable key from Base44 app
   - Extract Stripe secret key from Base44 backend
   - Migrate to Supabase Edge Functions for webhook handling
   - Update webhook endpoints in Stripe dashboard

2. **Google Maps Integration**
   - Extract Google Maps API key from Base44
   - Configure for React Native Maps
   - Enable required APIs: Places, Geocoding, Maps

3. **Migration Checklist**
   - [ ] Export Stripe keys from Base44
   - [ ] Export Google Maps key from Base44
   - [ ] Test keys in development environment
   - [ ] Update Stripe webhook URLs
   - [ ] Configure Google Maps for mobile usage

## 📊 Database Schema (Supabase)

### Core Tables
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extends Supabase auth.users)
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

-- Businesses
CREATE TABLE public.businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
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

-- Coupons
CREATE TABLE public.coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_amount TEXT NOT NULL,
  terms TEXT,
  usage_limit_type TEXT DEFAULT 'once' CHECK (usage_limit_type IN ('once', 'daily', 'monthly_1', 'monthly_2', 'monthly_4')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redemptions
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

-- Add indexes for performance
CREATE INDEX profiles_subscription_status_idx ON profiles(subscription_status);
CREATE INDEX businesses_location_idx ON businesses(latitude, longitude);
CREATE INDEX businesses_active_idx ON businesses(active);
CREATE INDEX coupons_business_active_idx ON coupons(business_id, active);
CREATE INDEX coupons_date_idx ON coupons(start_date, end_date);
CREATE INDEX redemptions_user_idx ON redemptions(user_id);
CREATE INDEX redemptions_status_idx ON redemptions(status);
```

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Businesses: Public read, admin write
CREATE POLICY "Anyone can view active businesses" ON businesses
  FOR SELECT USING (active = true);

-- Coupons: Public read active coupons, admin write
CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (active = true AND start_date <= NOW() AND end_date >= NOW());

-- Redemptions: Users can see their own, admins can see all
CREATE POLICY "Users can view their own redemptions" ON redemptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own redemptions" ON redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 📱 Mobile App Features

### Core User Flows

#### 1. Onboarding & Authentication
- **Welcome Screen**: App introduction
- **Sign Up**: Email, password, full name, address (with Google Places autocomplete)
- **Sign In**: Email/password with "Remember Me"
- **Password Reset**: Email-based reset flow
- **Location Permission**: Request location access for nearby deals

#### 2. Subscription Management
- **Non-Subscriber View**: 
  - Explanation of benefits
  - Pricing plans ($4.99/month)
  - Subscribe button → Stripe checkout
- **Subscriber View**: 
  - Active subscription indicator
  - Manage subscription (cancel, update payment)
  - Billing history

#### 3. Coupon Discovery & Redemption
- **Home Screen**: List of nearby coupons
- **Search & Filter**: 
  - Sort by distance, savings amount, expiration
  - Filter by business category
  - Search by business name
- **Coupon Details**: Full description, terms, business info
- **Redemption Flow**:
  1. Tap "Redeem" button
  2. Generate QR code + display code
  3. 60-second countdown timer
  4. Auto-expire and update usage count
- **QR Code Display**: Large QR code + alphanumeric code for backup

#### 4. Profile & Settings
- **Profile Management**: Edit personal info, address
- **Subscription Status**: View current plan, billing info
- **Location Settings**: Toggle GPS vs saved address
- **Notifications**: Push notification preferences
- **Support**: Contact info, FAQ

### Advanced Features

#### 1. Push Notifications
- New coupons from favorite businesses
- Expiring coupons (24h warning)
- Subscription renewal reminders
- Location-based offers (geofencing)

#### 2. Favorites & History
- Save favorite businesses
- Redemption history with receipt details
- Usage tracking per coupon type

#### 3. Social Features (Future)
- Share deals with friends
- Business reviews/ratings
- Loyalty program integration

## 🎨 UI/UX Design System

### Design Principles
- **Mobile-First**: Optimized for thumb navigation
- **Clean & Modern**: Professional appearance for businesses
- **Accessible**: High contrast, large touch targets
- **Fast**: Optimized loading and smooth animations

### Color Palette
- **Primary**: #22C55E (Green - savings/money theme)
- **Secondary**: #3B82F6 (Blue - trust/reliability)
- **Accent**: #F59E0B (Amber - urgency/limited time)
- **Background**: #FAFAFA (Light gray)
- **Text**: #1F2937 (Dark gray)
- **Error**: #EF4444 (Red)
- **Success**: #10B981 (Green)

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Buttons**: Inter Medium
- **Monospace**: JetBrains Mono (for codes)

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Full-width primary actions, ghost secondaries
- **Input Fields**: Clean borders, focus states
- **Navigation**: Bottom tab bar for main sections
- **QR Display**: Full-screen modal with timer

## 🔧 Technical Implementation

### Project Structure
```
saverly-mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   ├── coupon/         # Coupon-related components
│   │   └── auth/           # Authentication components
│   ├── screens/            # Screen components
│   │   ├── auth/           # Login, register, reset
│   │   ├── home/           # Main coupon feed
│   │   ├── profile/        # User profile management
│   │   └── admin/          # Admin dashboard (web only)
│   ├── services/           # API calls and business logic
│   │   ├── supabase.ts     # Supabase client
│   │   ├── auth.ts         # Authentication service
│   │   ├── coupons.ts      # Coupon management
│   │   └── stripe.ts       # Payment processing
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── types/              # TypeScript definitions
│   └── constants/          # App constants
├── assets/                 # Images, fonts, etc.
└── docs/                   # Documentation
```

### Key Dependencies
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react-native": "0.73.0",
    "@supabase/supabase-js": "^2.39.0",
    "@stripe/stripe-react-native": "^0.37.0",
    "react-navigation": "^6.0.0",
    "react-native-maps": "^1.10.0",
    "react-native-qrcode-scanner": "^1.5.0",
    "expo-location": "~16.5.0",
    "expo-notifications": "~0.27.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  }
}
```

### Development Workflow
1. **Local Development**: Expo CLI with hot reload
2. **Testing**: Jest + React Native Testing Library
3. **Type Safety**: TypeScript throughout
4. **Code Quality**: ESLint + Prettier
5. **Version Control**: Git with conventional commits
6. **CI/CD**: GitHub Actions → EAS Build → App Store deployment

## 🚀 Deployment Strategy

### Mobile App Deployment
- **Development**: Expo Go app for testing
- **Staging**: EAS Build preview builds
- **Production**: EAS Build → App Store & Google Play Store
- **Updates**: Expo Updates for OTA updates (non-native changes)

### Web Admin Dashboard
- **Framework**: React (Vite)
- **Hosting**: Netlify
- **Build**: `npm run build` → static files
- **Domain**: admin.saverly.app

### Backend (Supabase)
- **Database**: Hosted PostgreSQL
- **Authentication**: Built-in auth service
- **Edge Functions**: Stripe webhooks, business logic
- **Storage**: Business logos, user avatars
- **Real-time**: Live subscription updates

### Environment Configuration
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (from Base44 migration)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Google Maps (from Base44 migration)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_APP_VERSION=1.0.0
```

## 📋 Migration Plan from Replit Codebase

### Phase 1: Foundation Setup (Week 1)
1. Create React Native project with Expo
2. Set up Supabase project and database
3. Migrate database schema from Replit PostgreSQL
4. Configure authentication with Supabase
5. Set up basic navigation structure

### Phase 2: Core Features (Week 2-3)
1. Implement authentication screens
2. Build coupon discovery and display
3. Create QR code generation and redemption
4. Integrate Stripe payment processing
5. Add location services and maps

### Phase 3: Advanced Features (Week 4)
1. Push notifications setup
2. Profile management
3. Admin dashboard (web)
4. Testing and bug fixes
5. Performance optimization

### Phase 4: Deployment (Week 5)
1. App store preparation
2. Production deployment
3. User acceptance testing
4. Launch preparation

## ✅ Success Criteria

### Technical Metrics
- App loads in <3 seconds on 4G
- QR code generation in <1 second
- 99.9% uptime for backend services
- <50MB app bundle size
- Support for iOS 12+ and Android 8+

### Business Metrics
- User retention >70% after 7 days
- Subscription conversion rate >5%
- Average session duration >3 minutes
- App store rating >4.0 stars

### User Experience
- Intuitive onboarding flow
- Seamless payment integration
- Reliable location-based features
- Responsive customer support

## 📞 Support & Maintenance

### Ongoing Tasks
- Monthly security updates
- Quarterly feature releases
- Regular dependency updates
- Performance monitoring
- User feedback integration

### Monitoring & Analytics
- Supabase Analytics for backend metrics
- Expo Analytics for app usage
- Stripe Dashboard for payment metrics
- Google Analytics for web admin dashboard

---

## 📝 Notes

### API Key Migration from Base44
- **Current Status**: Keys identified in Base44 codebase
- **Migration Date**: TBD during development Phase 1
- **Testing Required**: All payment flows and map functionality
- **Backup Plan**: Keep Base44 keys active during transition

### Future Enhancements
- Business self-service portal
- Loyalty point system
- Social sharing features
- Multi-language support
- Franchise/multi-location business support

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-25  
**Next Review**: TBD based on development progress
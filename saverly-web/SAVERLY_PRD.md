# Saverly - Comprehensive Product Requirements Document (PRD)

## Executive Summary

Saverly is a **local-first digital coupon marketplace** connecting businesses in Northeast Tennessee with cost-conscious consumers through exclusive digital coupons and deals. The platform features a **mobile-optimized web application** for consumers and a comprehensive **admin dashboard** for business management, all powered by a modern **local development setup** with **Supabase integration**.

**Key Value Proposition**: Local businesses can create and manage digital coupons while subscribers ($4.99/month) access exclusive deals in their area through an intuitive, mobile-first experience.

## 🏗️ Complete Technical Architecture

### Frontend Stack
- **Framework**: React 19 + Vite 7 (Lightning-fast development)
- **Language**: TypeScript (Full type safety)
- **UI Framework**: Tailwind CSS 4 + Custom Design System
- **Navigation**: React Router DOM v7
- **State Management**: React hooks + Context API
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Supabase client (built-in)
- **Icons**: Heroicons + Lucide React
- **Charts**: Recharts (for analytics)
- **QR Codes**: qrcode + qr-scanner libraries

### Backend & Infrastructure
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- **Database**: PostgreSQL with advanced schema and RLS
- **Authentication**: Supabase Auth with email/password
- **File Storage**: Supabase Storage (business logos, assets)
- **Payments**: Stripe integration with subscription management
- **Real-time**: Supabase Realtime for live updates
- **API**: Supabase Auto-generated REST API + Edge Functions

### Development & Deployment
- **Dev Server**: Vite with HMR and port 5174
- **Build Tool**: Vite with optimized bundling
- **Hosting**: Netlify with custom domain
- **Version Control**: Git (no remote repository configured)
- **Code Quality**: ESLint + TypeScript strict mode
- **Package Manager**: npm with package-lock.json

## 🎨 Authentic Saverly Design System

### Brand Identity
- **Primary Color**: `#22C55E` (Vibrant Green - representing savings and growth)
- **Primary Dark**: `#16A34A` (Deep Green - for hover states)
- **Primary Light**: `#86EFAC` (Light Green - for backgrounds)
- **Primary Background**: `#DCFCE7` (Very Light Green - for cards)
- **Secondary**: `#3B82F6` (Trust Blue)
- **Accent**: `#F59E0B` (Urgency Amber)

### Visual Design Principles
- **Green Gradient Theme**: Linear gradients from primary to primary-dark
- **Saverly Logo**: Bold "S" in a green circle with gradient background
- **Typography**: Inter font family (Google Fonts)
- **Modern Card Design**: Rounded corners, subtle shadows, hover animations
- **Mobile-First**: Optimized for thumb navigation and touch interactions

### Component System
```css
/* Saverly's signature green gradient */
.btn-primary {
  background: linear-gradient(135deg, var(--saverly-primary) 0%, var(--saverly-primary-dark) 100%);
}

/* Coupon cards with distinctive design */
.coupon-card::before {
  background: linear-gradient(90deg, var(--saverly-primary) 0%, var(--saverly-accent) 100%);
}
```

## 📱 Mobile-Optimized Web Application

### Target Experience
- **Primary Platform**: Mobile-optimized Progressive Web App (PWA)
- **Secondary Platform**: Desktop web access (responsive design)
- **Admin Dashboard**: Separate React application for business management
- **Local Development**: Vite dev server with hot reload

### Core User Journey

#### 1. Welcome & Onboarding
- **Welcome Screen**: Brand introduction with green gradient header
- **Value Proposition**: "Your Local Coupon Marketplace"
- **Sign Up Flow**: Email, password, full name, location
- **Location Services**: Automatic location detection or manual address entry

#### 2. Subscription Management (Stripe Integration)
- **Pricing**: $4.99/month subscription model
- **Payment Processing**: Stripe Checkout integration
- **Subscription States**: active, inactive, past_due, canceled, trialing
- **Billing**: Stripe Customer Portal for subscription management

#### 3. Coupon Discovery & Redemption
- **Coupon Feed**: Location-based coupon discovery
- **Business Profiles**: Detailed business information with logos
- **QR Code Redemption**: Generate unique QR codes with display codes
- **Redemption Tracking**: Real-time status updates and usage limits

#### 4. Admin Dashboard Features
- **Business Management**: CRUD operations for businesses
- **Coupon Management**: Create, edit, and track coupon performance
- **Analytics Dashboard**: Real-time metrics with Recharts visualizations
- **User Management**: Subscriber analytics and insights

## 🗄️ Supabase Database Architecture

### Optimized Schema Design
The database uses advanced PostgreSQL features with comprehensive ENUM types:

```sql
-- ENUM Types for Performance and Consistency
subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
subscription_plan: 'monthly' | 'yearly'
business_category: 'restaurant' | 'retail' | 'service' | 'entertainment' | 'health' | 'beauty' | 'automotive' | 'other'
discount_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_item'
usage_limit_type: 'once' | 'daily' | 'weekly' | 'monthly' | 'unlimited'
redemption_status: 'pending' | 'redeemed' | 'expired' | 'canceled'
```

### Core Tables

#### Profiles (User Management)
- Extends Supabase auth.users with subscription data
- Location tracking (latitude/longitude)
- Stripe integration (customer_id, subscription_id)
- Preferences (notifications, location sharing, marketing emails)

#### Businesses (Local Business Directory)
- Complete business information with contact details
- Geolocation data for proximity searches
- Business metrics (total_coupons, total_redemptions, average_rating)
- Operating hours as flexible JSONB
- Verification status and activity flags

#### Coupons (Digital Coupon System)
- Flexible discount types (percentage, fixed amount, BOGO, free item)
- Advanced usage limits with time-based restrictions
- Performance tracking (view_count, redemption_count)
- Tag system for categorization
- Priority system for featured coupons

#### Redemptions (QR Code System)
- Unique QR codes with backup display codes
- Location tracking for redemption analytics
- Complete audit trail with device information
- Value tracking for business insights

### Performance Optimizations
- **Strategic Indexes**: Location-based, status-based, and date-range indexes
- **Automated Triggers**: Auto-update business metrics on coupon/redemption changes
- **Row Level Security**: Comprehensive RLS policies for data protection
- **Analytics Events**: Dedicated table for user behavior tracking

## 🔧 Local Development Setup

### Environment Configuration
```bash
# Required Environment Variables
VITE_SUPABASE_URL=https://lziayzusujlvhebyagdl.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Local Development Commands
```bash
# Start development server
npm run dev
# → Runs on http://localhost:5174

# Build for production
npm run build
# → Creates optimized dist/ folder

# Type checking and linting
npm run lint
# → ESLint with TypeScript support

# Preview production build
npm run preview
# → Serves built files locally
```

### Development Workflow
1. **Hot Module Replacement**: Instant updates during development
2. **TypeScript Integration**: Full type safety with strict mode
3. **Environment Validation**: EnvironmentCheck component validates configuration
4. **Security Headers**: Comprehensive security configuration in vite.config.ts
5. **Code Splitting**: Optimized bundles for vendor, Supabase, and forms

## 🌐 SPARC + Swarm Integration

### Claude Flow Coordination
The project integrates with **Claude Flow MCP tools** for enhanced development coordination:

#### Swarm Orchestration
- **Topology**: Hierarchical swarms for complex development tasks
- **Agent Types**: Specialized agents (researcher, coder, analyst, tester, coordinator)
- **Memory Management**: Persistent memory across development sessions
- **Neural Training**: Continuous learning from development patterns

#### Coordination Hooks
```bash
# Pre-task coordination
npx claude-flow hooks pre-task --description "Feature development"

# Progress tracking
npx claude-flow hooks post-edit --file "filename" --memory-key "agent/step"

# Decision recording
npx claude-flow hooks notify --message "Implementation decision" --level "info"

# Task completion
npx claude-flow hooks post-task --task-id "task" --analyze-performance true
```

### Development Benefits
- **84.8% SWE-Bench solve rate**: Enhanced problem-solving coordination
- **32.3% token reduction**: Efficient task breakdown and parallel execution
- **2.8-4.4x speed improvement**: Coordinated development workflows
- **Cross-session memory**: Persistent context and learning

## 🗂️ Complete Project Structure

```
saverly-web/
├── 📱 Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── mobile/         # Mobile-specific components
│   │   │   │   ├── WelcomeScreen.tsx      # Brand introduction
│   │   │   │   ├── CouponFeed.tsx         # Main coupon discovery
│   │   │   │   ├── CouponCard.tsx         # Individual coupon display
│   │   │   │   ├── QRRedemption.tsx       # QR code generation/scanning
│   │   │   │   ├── SubscriptionGate.tsx   # Subscription management
│   │   │   │   └── SaverlyHeader.tsx      # Branded header component
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   │   ├── AnalyticsDashboard.tsx # Real-time metrics
│   │   │   │   ├── CouponManagement.tsx   # Coupon CRUD operations
│   │   │   │   └── BusinessInsights.tsx   # Business analytics
│   │   │   ├── ui/             # Base UI components
│   │   │   └── auth/           # Authentication components
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.ts      # Authentication state
│   │   │   ├── useCoupons.ts   # Coupon data management
│   │   │   ├── useLocation.ts  # Geolocation services
│   │   │   ├── useRedemptions.ts # Redemption tracking
│   │   │   ├── useStripe.ts    # Payment processing
│   │   │   └── useSubscription.ts # Subscription management
│   │   ├── services/           # API and business logic
│   │   │   ├── businessService.ts    # Business operations
│   │   │   ├── couponService.ts      # Coupon management
│   │   │   ├── redemptions.ts        # Redemption handling
│   │   │   ├── stripe.ts            # Payment integration
│   │   │   └── googleMaps.ts        # Maps integration
│   │   ├── lib/                # Core utilities
│   │   │   ├── supabase.ts     # Database client and types
│   │   │   ├── validation.ts   # Form validation schemas
│   │   │   └── errors.ts       # Error handling utilities
│   │   └── styles/             # Styling and design system
│   │       └── saverly-design.css # Complete design system
│   ├── api/                    # Serverless API functions
│   │   └── stripe/            # Stripe webhook handlers
│   ├── public/                # Static assets and PWA configuration
│   └── supabase/              # Database schema and migrations
│       └── schema.sql         # Complete optimized schema
├── 🔧 Configuration Files
│   ├── vite.config.ts         # Vite configuration with security headers
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── eslint.config.js       # ESLint configuration
│   ├── package.json           # Dependencies and scripts
│   └── netlify.toml           # Netlify deployment configuration
└── 📚 Documentation
    ├── SAVERLY_PRD.md         # This comprehensive PRD
    └── README.md              # Quick start guide
```

## 🚀 Step-by-Step Setup for New Developers

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Modern web browser
- Code editor (VS Code recommended)

### 1. Project Setup
```bash
# Clone or download the project
cd /path/to/saverly-web

# Install dependencies
npm install

# Verify installation
npm run lint
```

### 2. Supabase Configuration
```bash
# Create .env.local file
touch .env.local

# Add required environment variables
echo "VITE_SUPABASE_URL=https://lziayzusujlvhebyagdl.supabase.co" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env.local
```

### 3. Database Setup
```bash
# Install Supabase CLI (if needed)
npm install -g @supabase/cli

# Initialize local Supabase (optional for local development)
supabase start

# Run schema migrations
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/schema.sql
```

### 4. Payment Integration
```bash
# Add Stripe configuration to .env.local
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key" >> .env.local

# Test Stripe integration
npm run dev
# Navigate to subscription flow and test with Stripe test cards
```

### 5. Development Server
```bash
# Start development server
npm run dev
# → Application available at http://localhost:5174

# Verify all components load
# ✅ Welcome screen with Saverly branding
# ✅ Authentication flows
# ✅ Coupon feed (may be empty initially)
# ✅ Admin dashboard at /admin
```

### 6. Adding Sample Data
```bash
# The schema.sql includes sample businesses and coupons
# Or add data through the admin dashboard:
# 1. Navigate to http://localhost:5174/admin
# 2. Log in with admin credentials
# 3. Add sample businesses and coupons
```

## 🔐 Environment Variables Reference

### Required for Development
```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://lziayzusujlvhebyagdl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration (Required for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
# Server-side (for webhooks in api/ folder)
STRIPE_SECRET_KEY=sk_test_51...

# Google Maps (Optional - for enhanced location features)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC...
```

### Optional Configuration
```bash
# Development Mode
NODE_ENV=development
VITE_APP_VERSION=1.0.0

# Analytics (Future)
VITE_GOOGLE_ANALYTICS_ID=G-...

# Feature Flags
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_GEOLOCATION=true
```

## 🎯 Local-First Development Strategy

### Why Local-First?
1. **Fast Development**: Instant feedback with Vite's HMR
2. **Offline Capability**: Work without internet connection
3. **Cost Effective**: Minimal cloud costs during development
4. **Full Control**: Complete ownership of development environment
5. **Security**: Sensitive data remains local during development

### Development vs. Production
- **Development**: Local Vite server, Supabase hosted database
- **Staging**: Netlify preview deployments
- **Production**: Netlify hosting with Supabase production database

### Data Persistence Strategy
- **User Data**: Stored in Supabase (cloud)
- **Session Data**: Browser localStorage with Supabase session
- **Development Data**: Local .env.local configuration
- **Build Artifacts**: Local dist/ folder (gitignored)

## 📊 Performance & Quality Metrics

### Technical Performance
- **Bundle Size**: Optimized with Vite code splitting
- **Loading Speed**: <3 seconds on 3G networks
- **Lighthouse Score**: Target >90 for all metrics
- **Type Safety**: 100% TypeScript coverage
- **Security**: Comprehensive CSP and security headers

### Business Metrics
- **User Engagement**: Session duration >3 minutes
- **Conversion Rate**: Subscription signup >5%
- **Retention**: 70%+ weekly active users
- **Business Adoption**: Local business onboarding flow

### Development Quality
- **Code Coverage**: >80% test coverage (future)
- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: ESLint with no warnings
- **Performance**: Vite dev server <500ms reload times

## 🛡️ Security & Compliance

### Data Protection
- **Row Level Security**: Comprehensive RLS policies in Supabase
- **Environment Variables**: Secure configuration management
- **Payment Security**: PCI-compliant Stripe integration
- **Authentication**: Supabase Auth with JWT tokens

### Privacy Features
- **Location Privacy**: Optional location sharing
- **Data Minimization**: Collect only necessary user data
- **User Control**: Profile deletion and data export
- **Transparent Terms**: Clear privacy policy and terms

## 🚀 Deployment & Scaling

### Deployment Pipeline
1. **Development**: Local Vite dev server
2. **Staging**: Netlify preview deployments on pull requests
3. **Production**: Netlify production deployment
4. **CDN**: Automatic global CDN distribution
5. **SSL**: Automatic HTTPS with Let's Encrypt

### Scaling Considerations
- **Database**: Supabase auto-scaling PostgreSQL
- **File Storage**: Supabase Storage with CDN
- **Edge Functions**: Supabase Edge Functions for webhooks
- **Frontend**: Netlify global CDN distribution

### Monitoring & Analytics
- **Error Tracking**: Console logging with structured errors
- **Performance**: Lighthouse CI integration
- **User Analytics**: Supabase Analytics for user behavior
- **Business Metrics**: Custom dashboard for business insights

## 📈 Future Roadmap

### Short-term Enhancements (3-6 months)
- **Push Notifications**: Web push API integration
- **PWA Features**: Offline functionality and app-like experience
- **Social Features**: Business reviews and ratings
- **Enhanced Analytics**: Advanced business insights dashboard

### Medium-term Goals (6-12 months)
- **Multi-location Support**: Franchise business management
- **Loyalty Programs**: Points and rewards system
- **API Marketplace**: Third-party integrations
- **Mobile Apps**: Native iOS and Android applications

### Long-term Vision (12+ months)
- **Marketplace Expansion**: Multi-city deployment
- **Business Intelligence**: Predictive analytics for businesses
- **Community Features**: User-generated content and social sharing
- **Enterprise Features**: White-label solutions for other markets

## 📞 Support & Resources

### Documentation
- **API Reference**: Supabase auto-generated documentation
- **Component Library**: Storybook documentation (future)
- **Developer Guide**: Comprehensive setup and development guide
- **Business Guide**: Admin dashboard user manual

### Development Support
- **Issue Tracking**: GitHub Issues or project-specific tracker
- **Code Reviews**: Collaborative development process
- **Knowledge Base**: Internal documentation and troubleshooting
- **Community**: Developer community for Supabase and React

### Business Support
- **Customer Support**: Help desk for subscriber issues
- **Business Onboarding**: Guided setup for new businesses
- **Training**: Admin dashboard training materials
- **Analytics**: Regular business performance reports

---

## 📝 Summary for New Claude Instances

**Saverly** is a complete, production-ready **local coupon marketplace** built with **React + Vite + Supabase**. The project features:

1. **🎨 Authentic Green Gradient Design**: Professional branding with Saverly's signature green theme
2. **📱 Mobile-Optimized PWA**: Full-featured web application optimized for mobile users
3. **🗄️ Advanced Database**: Optimized PostgreSQL schema with comprehensive business logic
4. **💳 Stripe Integration**: Full subscription management with $4.99/month pricing
5. **👨‍💼 Admin Dashboard**: Complete business management interface
6. **🔧 Local Development**: Fast Vite development with comprehensive TypeScript support
7. **🌐 SPARC Integration**: Enhanced development coordination with Claude Flow MCP tools

**Key Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 5174)
npm run build        # Build for production
npm run lint         # Type checking and code quality
```

**Environment:** Configure `.env.local` with Supabase and Stripe credentials for full functionality.

**Goal:** Provide local businesses in Northeast Tennessee with a modern, efficient platform to reach customers through digital coupons while offering consumers significant savings through an intuitive mobile experience.

---

**Document Version**: 2.0  
**Last Updated**: 2025-07-26  
**Created for**: Complete Claude instance onboarding  
**Next Review**: Based on development progress and feature updates
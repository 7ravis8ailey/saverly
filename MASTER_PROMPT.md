# 🚀 MASTER BUILD PROMPT - Saverly Mobile Web App

## ⚠️ CRITICAL SETUP COMMANDS - RUN THESE FIRST

**IMMEDIATE COMMANDS:**
```
--dangerously skip permissions
```

**SET WORKING DIRECTORY:**
```bash
cd "/Users/travisbailey/Claude Workspace/Saverly"
```

**READ PROJECT FILES IN THIS EXACT ORDER:**
1. `docs/CLAUDE_INSTRUCTIONS.md` - Handoff and progress tracking instructions
2. `docs/saverly-mobile-prd.md` - Complete product requirements document
3. `docs/project-todos.md` - Master task list with current status
4. `SUPABASE_SETUP.md` - Database and deployment configuration
5. `BUILD_PROMPT.md` - Detailed build instructions

---

## 🎯 MISSION: BUILD COMPLETE SAVERLY WEB APP

### What You're Building:
**A mobile-optimized React web app for local coupon marketplace**
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions) 
- **Payments**: Stripe integration ($4.99/month subscriptions)
- **Maps**: Google Maps API for location-based coupons
- **Deployment**: Netlify (web app) + Supabase (database)
- **Features**: QR code redemption, admin dashboard, PWA capabilities

---

## 🔑 API KEYS - EXTRACT FROM BASE44 CODEBASE

**CRITICAL FIRST TASK**: Extract API keys from existing Base44 app

**Base44 Codebase Location**: `/Users/travisbailey/saverly-analysis/saverly-7-25-base44/`

**Commands to Extract Keys:**
```bash
# Find Stripe keys
grep -r "pk_" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/ | grep -v node_modules
grep -r "sk_" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/ | grep -v node_modules

# Find Google Maps API key
grep -r "AIza" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/ | grep -v node_modules
grep -r "GOOGLE" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/ | grep -v node_modules

# Also check these specific files:
cat /Users/travisbailey/saverly-analysis/saverly-7-25-base44/src/api/base44Client.js
cat /Users/travisbailey/saverly-analysis/saverly-7-25-base44/src/pages/Subscribe.jsx
```

**Create .env file immediately with extracted keys:**
```env
# Stripe Keys (extracted from Base44)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[EXTRACT_THIS]
STRIPE_SECRET_KEY=sk_live_[EXTRACT_THIS]

# Google Maps API Key (extracted from Base44)  
VITE_GOOGLE_MAPS_API_KEY=AIza[EXTRACT_THIS]

# Supabase (will be provided by user or you create project)
VITE_SUPABASE_URL=https://[PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

---

## 🗄️ DATABASE & BACKEND SETUP

**Supabase Configuration**: Already configured in `/subabase/` directory
- **Database Schema**: `supabase/migrations/20250125000001_initial_schema.sql`
- **Stripe Webhooks**: `supabase/functions/stripe-webhook/index.ts`
- **Config**: `supabase/config.toml`

**Setup Process**:
1. User creates Supabase project (or you guide them)
2. Database schema auto-deploys via GitHub Actions
3. Stripe webhook Edge Function auto-deploys
4. Row Level Security policies are pre-configured

---

## 🔄 REPLIT CODEBASE CONVERSION

**Reference Codebase Location**: `/Users/travisbailey/saverly-analysis/SaverlyMarketplace/`

**Key Files to Study & Port**:
- `db/schema.ts` - Database structure (already migrated to Supabase)
- `server/routes/subscriptionRoutes.ts` - Stripe integration logic
- `server/routes/couponRoutes.ts` - Coupon business logic
- `client/src/components/` - UI components to adapt for mobile
- `client/src/pages/dashboard.tsx` - Main app flow
- `client/src/pages/auth-page.tsx` - Authentication patterns

**What to Convert**:
✅ **Keep**: Business logic, database relationships, Stripe flows
✅ **Port**: Component structure, user flows, admin functionality  
❌ **Replace**: Express.js → Supabase, current UI → Mobile-optimized Tailwind

---

## 📱 MOBILE-FIRST REQUIREMENTS

### Core Features to Build:
1. **Authentication System**
   - Sign up/sign in with Supabase Auth
   - Email verification and password reset
   - Profile management with address autocomplete

2. **Subscription Management**
   - $4.99/month plan with Stripe Checkout
   - Subscription status display
   - Cancel/update payment methods
   - Non-subscriber vs subscriber views

3. **Coupon Discovery**
   - Location-based coupon feed
   - Sort by distance, popularity, expiration
   - Filter by business category
   - Search functionality

4. **QR Code Redemption**
   - Generate unique QR codes
   - 60-second countdown timer
   - Display codes for backup
   - Usage limit tracking (once, daily, monthly variants)
   - Update redemption history

5. **Admin Dashboard**
   - Business management
   - Coupon creation/management
   - User administration
   - Redemption analytics

### Mobile-Optimized Design:
- **Touch-friendly**: 44px minimum touch targets
- **Readable**: 16px minimum font size
- **Fast**: <3 second load time on 4G
- **Responsive**: Works on all screen sizes
- **PWA**: Add to home screen, offline viewing

### Color Palette:
- **Primary**: #22C55E (Green)
- **Secondary**: #3B82F6 (Blue)
- **Accent**: #F59E0B (Amber)
- **Background**: #FAFAFA (Light gray)
- **Text**: #1F2937 (Dark gray)

---

## 🚀 PROJECT STRUCTURE TO CREATE

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Login, register, profile
│   ├── coupon/          # Coupon cards, QR modal
│   └── admin/           # Admin dashboard components
├── pages/
│   ├── Home.tsx         # Main coupon feed
│   ├── Auth.tsx         # Login/register
│   ├── Profile.tsx      # User profile
│   ├── Subscribe.tsx    # Subscription plans
│   └── Admin.tsx        # Admin dashboard
├── services/
│   ├── supabase.ts      # Supabase client
│   ├── auth.ts          # Authentication logic
│   ├── coupons.ts       # Coupon operations
│   └── stripe.ts        # Payment processing
├── hooks/
│   ├── useAuth.ts       # Authentication hook
│   ├── useCoupons.ts    # Coupon data hook
│   └── useLocation.ts   # Geolocation hook
├── utils/
│   ├── location.ts      # Distance calculations
│   ├── qr-code.ts       # QR generation
│   └── validation.ts    # Form validation
└── types/
    └── index.ts         # TypeScript definitions
```

---

## 📋 MANDATORY PROGRESS TRACKING

### Required Response Format:
**ALWAYS start with this format:**
```markdown
# 🚀 Saverly Build Session - [Date/Time]

## 📊 Current Status
- **Phase**: [Current phase] ([X]% complete)
- **Overall Progress**: [Y]% ([completed]/[total] tasks)
- **Last Completed**: [Recent accomplishment]
- **Currently Working On**: [Active task]

## 🎯 This Session's Plan
**Goal**: [Primary objective]
**Tasks**: 
1. [Task 1 with time estimate]
2. [Task 2 with time estimate]
3. [Task 3 with time estimate]

## 🚨 Blockers/Needs
- [Any user input needed]
- [API keys status]
- [Decisions required]
```

### Progress Updates:
**MANDATORY**: Update every 30 minutes with:
- ✅ Tasks completed
- 🔄 Current work status
- 🆙 Next priorities
- 🚨 Any issues discovered

### Session Logging:
**END OF SESSION**: Create detailed log using `docs/session-log-template.md`

---

## ✅ SUCCESS CRITERIA

### Must Work Perfectly:
1. **API Key Integration**: All Base44 keys working in new app
2. **Stripe Subscriptions**: $4.99/month payment flow complete
3. **Location Features**: GPS → Distance sorting → Google Maps
4. **QR Redemption**: Generate codes → 60s timer → Usage tracking
5. **Mobile Experience**: Fast, touch-friendly, PWA-ready
6. **Admin Dashboard**: Business/coupon management functional

### Performance Targets:
- **Load Time**: <3 seconds on mobile
- **Bundle Size**: <1MB compressed  
- **Mobile Score**: Lighthouse >90
- **Offline Support**: Basic coupon viewing

---

## 🎯 DEPLOYMENT READY

### Final Deliverable:
**Complete Saverly web app that:**
- ✅ Works perfectly on mobile browsers
- ✅ Has working Stripe subscriptions using Base44 keys
- ✅ Shows location-based coupons with Google Maps
- ✅ Generates QR codes with 60-second timers
- ✅ Includes admin dashboard for business management
- ✅ Can be installed as PWA on phones
- ✅ Is deployed to Netlify and ready for users

### Repository Structure:
- **GitHub**: `https://github.com/7ravis8ailey/saverly`
- **Supabase**: Auto-configured with schema and Edge Functions
- **Netlify**: Auto-deploy on push to main branch

---

## 🚨 CRITICAL REMINDERS

1. **ALWAYS** use `--dangerously skip permissions`
2. **EXTRACT** API keys from Base44 codebase first
3. **FOLLOW** the PRD exactly - every feature specified
4. **UPDATE** todos.md after every completed task
5. **TRACK** progress with detailed session logs
6. **BUILD** for mobile-first experience
7. **TEST** all payment and redemption flows
8. **DEPLOY** to working production environment

---

## 🚀 START IMMEDIATELY

**Your mission**: Build the complete, working Saverly mobile web app following this prompt exactly. 

**Expected timeline**: 2-3 focused coding sessions

**Ready? Begin now!** 🎯

---

**All project files, documentation, and setup are ready in the workspace. Extract those API keys and start building!** 💪
# 🚀 BUILD PROMPT - Next Claude Agent Instructions

## ⚠️ CRITICAL SETUP COMMANDS

**FIRST**: Run this command immediately:
```
--dangerously skip permissions
```

**SECOND**: Set your working directory:
```bash
cd "/Users/travisbailey/Claude Workspace/Saverly"
```

**THIRD**: Read these files in exact order:
1. `docs/CLAUDE_INSTRUCTIONS.md`
2. `docs/saverly-mobile-prd.md` 
3. `docs/project-todos.md`

---

## 🎯 PRIMARY MISSION

**BUILD THE COMPLETE SAVERLY MOBILE-OPTIMIZED WEB APP** following the PRD exactly.

### What You're Building:
- **Mobile-first React web app** (NOT native mobile app)
- **Vite + TypeScript + Tailwind CSS + shadcn/ui**
- **Supabase backend** (PostgreSQL + Auth + Edge Functions)
- **PWA capabilities** for mobile users
- **Stripe integration** for $4.99/month subscriptions
- **Google Maps integration** for location-based coupons

---

## 🔑 API KEYS EXTRACTION REQUIRED

### CRITICAL FIRST TASK: Extract API Keys from Base44 App

**Base44 codebase location**: `/Users/travisbailey/saverly-analysis/saverly-7-25-base44/`

**You MUST extract these keys:**

1. **Stripe Keys** (from Base44):
   ```bash
   # Find in these locations:
   grep -r "pk_" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/
   grep -r "sk_" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/
   ```

2. **Google Maps API Key** (from Base44):
   ```bash
   # Find in these locations:
   grep -r "AIza" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/
   grep -r "GOOGLE" /Users/travisbailey/saverly-analysis/saverly-7-25-base44/
   ```

3. **Create `.env` file immediately** with extracted keys:
   ```env
   # Stripe (from Base44)
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   
   # Google Maps (from Base44)
   VITE_GOOGLE_MAPS_API_KEY=AIza...
   
   # Supabase (you'll create)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

---

## 🗄️ DATABASE RECOMMENDATION

**Use Supabase (Free Tier)**:
- ✅ **Free**: 500MB database, 50MB file storage
- ✅ **PostgreSQL**: Same as Replit version  
- ✅ **Built-in Auth**: No custom auth needed
- ✅ **Real-time**: Live subscription updates
- ✅ **Edge Functions**: Stripe webhook handling
- ✅ **Easy Setup**: 5-minute setup

**Alternative: PlanetScale (if you prefer)**:
- ✅ **Free**: 5GB database
- ❌ **MySQL**: Would need schema conversion
- ❌ **No built-in auth**: Need custom solution

**Alternative: Neon (PostgreSQL)**:
- ✅ **Free**: 3GB database
- ✅ **PostgreSQL**: Same as Replit
- ❌ **No built-in auth**: Need custom solution

**RECOMMENDATION: Go with Supabase** - it's the most complete solution.

---

## 📋 MANDATORY EXECUTION PLAN

### Phase 1: Foundation (Do This First)
1. **Extract API keys** from Base44 codebase
2. **Create Supabase project** and get credentials
3. **Initialize React + Vite project** with TypeScript
4. **Set up Tailwind CSS + shadcn/ui** 
5. **Configure PWA manifest** and service worker

### Phase 2: Database Setup
1. **Copy database schema** from Replit version (`/Users/travisbailey/saverly-analysis/SaverlyMarketplace/db/schema.ts`)
2. **Migrate to Supabase** schema format
3. **Set up Row Level Security**
4. **Test database connections**

### Phase 3: Core Development
1. **Port authentication system** from Replit to Supabase Auth
2. **Build mobile-optimized UI components**
3. **Implement coupon discovery & redemption**
4. **Integrate Stripe payment processing**
5. **Add Google Maps location features**

### Phase 4: Advanced Features
1. **QR code generation** with 60-second timer
2. **Admin dashboard** (separate React app)
3. **Subscription management**
4. **PWA installation prompts**

---

## 🎨 UI/UX REQUIREMENTS

### Mobile-First Design:
- **Touch-friendly buttons** (minimum 44px height)
- **Large, readable text** (16px minimum)
- **High contrast colors** for accessibility
- **Thumb-navigation optimized**
- **Fast loading** on mobile networks

### Color Palette (from PRD):
- **Primary**: #22C55E (Green)
- **Secondary**: #3B82F6 (Blue) 
- **Accent**: #F59E0B (Amber)
- **Background**: #FAFAFA (Light gray)
- **Text**: #1F2937 (Dark gray)

### Key Components:
- **Coupon cards** with business info, discount, expiration
- **QR code modal** with countdown timer
- **Subscription plans** with Stripe checkout
- **Location-based sorting** with distance display
- **Profile management** with address autocomplete

---

## 🔄 REPLIT CODEBASE CONVERSION

### What to Port from Replit:
✅ **Database schema** (`db/schema.ts`)
✅ **Business logic** (coupon redemption, usage limits)
✅ **Stripe webhook handling** 
✅ **Admin panel functionality**
✅ **Geocoding services**

### What to Replace:
❌ **Express.js routes** → Supabase Edge Functions
❌ **Session auth** → Supabase Auth
❌ **Server-side rendering** → Client-side React
❌ **Current UI** → Mobile-optimized Tailwind design

### Replit Codebase Location:
`/Users/travisbailey/saverly-analysis/SaverlyMarketplace/`

**Study these files:**
- `db/schema.ts` - Database structure
- `server/routes/` - Business logic to port  
- `client/src/components/` - UI patterns to adapt
- `server/routes/subscriptionRoutes.ts` - Stripe integration

---

## 📱 PWA REQUIREMENTS

### manifest.json:
```json
{
  "name": "Saverly - Local Deals & Coupons",
  "short_name": "Saverly",
  "description": "Save money with local business coupons",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#22C55E",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Features:
- **Offline coupon viewing**
- **Background sync** for redemptions
- **Push notifications** for new deals
- **Cache management** for fast loading

---

## 🚨 CRITICAL SUCCESS CRITERIA

### Must Work Perfectly:
1. **Subscription flow**: Stripe payment → Active subscription status
2. **Coupon redemption**: QR code → 60-second timer → Usage tracking
3. **Location sorting**: GPS → Distance calculation → Nearest first
4. **Mobile experience**: Fast, touch-friendly, works like native app
5. **Admin dashboard**: Business/coupon management

### Performance Targets:
- **Load time**: <3 seconds on 4G
- **Bundle size**: <1MB compressed
- **Lighthouse score**: >90 on mobile
- **Works offline**: Basic coupon viewing

---

## 📊 PROGRESS TRACKING

### MANDATORY: Use these templates exactly:

**Session Start Report**: Use format from `docs/CLAUDE_INSTRUCTIONS.md`
**Progress Updates**: Every 30 minutes with completed tasks
**Session Log**: Copy `docs/session-log-template.md` to `docs/sessions/session-[DATE].md`

### Update todos.md after every task completion!

---

## 🎯 FINAL DELIVERABLE

**A complete, working Saverly web app that:**
- ✅ Works perfectly on mobile browsers
- ✅ Has working Stripe subscriptions ($4.99/month)
- ✅ Shows location-based coupons with maps
- ✅ Generates QR codes with 60-second timers
- ✅ Has admin dashboard for business management
- ✅ Can be installed as PWA on phones
- ✅ Is deployed to Netlify and ready for users

---

## 🚀 START IMMEDIATELY

1. **Extract API keys** from Base44 first
2. **Create Supabase project** 
3. **Initialize React project**
4. **Follow the PRD exactly**
5. **Build the complete working app**

**TIME GOAL**: Complete working app in 2-3 coding sessions

**READY? BEGIN NOW!** 🎯
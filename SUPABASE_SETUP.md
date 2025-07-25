# 🔗 Supabase Setup Instructions

## 🎯 GitHub → Supabase Integration

Your repository is now perfectly configured for Supabase! Here's what's been set up:

### 📁 **Repository Structure**
```
GitHub: https://github.com/7ravis8ailey/saverly
├── .github/workflows/
│   ├── deploy-supabase.yml    # Auto-deploy database changes
│   └── deploy-netlify.yml     # Auto-deploy web app
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── migrations/           # Database schema
│   └── functions/            # Edge Functions (Stripe webhooks)
```

## 🚀 **Next Steps for Supabase Integration**

### 1. **Create Your Supabase Project**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. **Organization**: Select "7ravis8ailey's Org" (or create it)
4. **Project Name**: "Saverly"
5. **Database Password**: Generate a strong password
6. **Region**: Choose closest to your users (US East/West)

### 2. **Connect GitHub Repository**
1. In Supabase Dashboard → Settings → Integrations
2. Click "GitHub Integration" 
3. Install Supabase GitHub App
4. **Select Repository**: `7ravis8ailey/saverly`
5. **Branch**: `main`
6. **Directory**: `./supabase` (already configured)

### 3. **Set GitHub Secrets**
In your GitHub repository settings → Secrets and variables → Actions:

```bash
# Supabase Secrets
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_PROJECT_REF=your_project_ref_id

# Frontend Environment Variables  
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe Keys (from Base44)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Google Maps (from Base44)
VITE_GOOGLE_MAPS_API_KEY=AIza...

# Netlify Deployment
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
```

### 4. **Initialize Database**
Once connected, GitHub Actions will automatically:
- ✅ Run database migrations (creates all tables)
- ✅ Set up Row Level Security policies
- ✅ Deploy Stripe webhook Edge Function
- ✅ Configure authentication

## 🔧 **Manual Setup Commands** (if needed)

If you prefer manual setup:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push

# Deploy Edge Functions
supabase functions deploy stripe-webhook
```

## ✅ **What's Already Configured**

### **Database Schema** 
- ✅ Users/Profiles with subscription tracking
- ✅ Businesses with location data
- ✅ Coupons with usage limits
- ✅ Redemptions with QR codes
- ✅ Row Level Security policies
- ✅ Performance indexes

### **Edge Functions**
- ✅ Stripe webhook handler
- ✅ Subscription status sync
- ✅ Customer lifecycle management

### **GitHub Actions**
- ✅ Auto-deploy database changes on push
- ✅ Auto-deploy web app to Netlify
- ✅ Environment variable injection

## 🎯 **Expected Results**

After setup, you'll have:
- 🔗 **GitHub ↔ Supabase**: Auto-sync on every commit
- 🗄️ **Database**: Fully configured with your schema  
- 🔐 **Authentication**: Ready for user signup/login
- 💳 **Stripe**: Webhook handling via Edge Functions
- 🚀 **Deployment**: Automatic to both Supabase and Netlify

## 🆘 **Troubleshooting**

**Common Issues:**
- **GitHub Actions failing**: Check secrets are set correctly
- **Database not updating**: Verify project ref and access token
- **Stripe webhooks not working**: Check webhook secret in Stripe dashboard

**Support:**
- Supabase Docs: https://supabase.com/docs
- GitHub Actions: Check the "Actions" tab in your repo
- Discord: Supabase Discord community

---

**✅ Your repository is perfectly configured for Supabase integration!**  
Just follow the setup steps above and everything will work automatically. 🚀
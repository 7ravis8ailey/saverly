# 🚀 Claude Flow Complete Supabase Control Setup

## 🎯 Goal: Give Claude Flow Full Supabase Admin Power

This setup gives Claude Flow the same level of control over Supabase that it has over GitHub - complete project creation, management, deployment, and monitoring.

## 📋 Prerequisites

### 1. Install Supabase CLI
```bash
# Install Supabase CLI globally
npm install -g supabase

# Or via Homebrew (macOS)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### 2. Authenticate with Supabase
```bash
# Login to Supabase (this will open a browser)
supabase login

# Verify authentication
supabase projects list
```

### 3. Build Enhanced MCP Server
```bash
cd "/Users/travisbailey/Claude Workspace/Saverly/mcp-supabase"

# Install dependencies (if not already done)
npm install

# Build the admin version
npx tsc src/admin-index.ts --outDir dist --module ESNext --target ES2022 --moduleResolution node --esModuleInterop
```

### 4. Replace Current MCP Server
```bash
# Remove old server
claude mcp remove supabase

# Add new superpowered server
claude mcp add supabase-admin node "/Users/travisbailey/Claude Workspace/Saverly/mcp-supabase/dist/admin-index.js"
```

## 🛠️ Available Admin Tools

### 🏗️ **Project Management**
```javascript
// Create brand new Supabase project
mcp__supabase-admin__supabase_project_create({
  project_name: "saverly-production",
  database_password: "your-secure-password",
  region: "us-east-1",
  plan: "pro"
})

// List all your projects
mcp__supabase-admin__supabase_project_list({})

// Initialize local project structure
mcp__supabase-admin__supabase_project_init({
  project_path: "/Users/travisbailey/Claude Workspace/Saverly",
  project_ref: "your-project-ref-id"
})
```

### 📊 **Database Schema Control**
```javascript
// Create new migration
mcp__supabase-admin__supabase_migration_create({
  migration_name: "create_saverly_tables",
  sql_content: `
    -- Create businesses table
    CREATE TABLE businesses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    -- Add RLS policies, indexes, etc.
  `,
  project_path: "/Users/travisbailey/Claude Workspace/Saverly"
})

// Apply migrations to database
mcp__supabase-admin__supabase_migration_apply({
  project_path: "/Users/travisbailey/Claude Workspace/Saverly"
})
```

### ⚡ **Edge Functions Management**
```javascript
// Create new Edge Function
mcp__supabase-admin__supabase_function_create({
  function_name: "stripe-webhook",
  function_code: `
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
    
    serve(async (req) => {
      // Your Stripe webhook logic here
      return new Response("OK", { status: 200 })
    })
  `,
  project_path: "/Users/travisbailey/Claude Workspace/Saverly"
})

// Deploy functions
mcp__supabase-admin__supabase_function_deploy({
  project_path: "/Users/travisbailey/Claude Workspace/Saverly"
})
```

### 🔐 **Environment & Secrets**
```javascript
// Set environment secrets
mcp__supabase-admin__supabase_secrets_set({
  secrets: {
    "STRIPE_SECRET_KEY": "sk_live_your_stripe_key",
    "GOOGLE_MAPS_API_KEY": "AIza_your_google_key",
    "STRIPE_WEBHOOK_SECRET": "whsec_your_webhook_secret"
  },
  project_path: "/Users/travisbailey/Claude Workspace/Saverly"
})
```

### 🔗 **Project Linking & Deployment**
```javascript
// Link local project to remote
mcp__supabase-admin__supabase_project_link({
  project_ref: "your-project-ref-id",
  project_path: "/Users/travisbailey/Claude Workspace/Saverly"
})

// Deploy everything at once
mcp__supabase-admin__supabase_deploy_all({
  project_path: "/Users/travisbailey/Claude Workspace/Saverly"
})
```

### 📈 **Enhanced Database Operations**
```javascript
// Raw SQL execution for complex operations
mcp__supabase-admin__supabase_query({
  sql: `
    SELECT 
      b.name as business_name,
      COUNT(c.id) as coupon_count,
      COUNT(r.id) as redemption_count
    FROM businesses b
    LEFT JOIN coupons c ON b.id = c.business_id
    LEFT JOIN redemptions r ON c.id = r.coupon_id
    GROUP BY b.id, b.name
    ORDER BY redemption_count DESC
    LIMIT 10;
  `
})

// Standard operations (same as before)
mcp__supabase-admin__supabase_query({
  table: "profiles",
  operation: "select",
  filters: { subscription_status: "active" }
})
```

## 🐝 Claude Flow Complete Project Setup Pattern

Here's how Claude Flow can set up the entire Saverly project from scratch:

```javascript
// === STEP 1: PROJECT CREATION ===
[BatchTool - Complete Project Setup]:
  // Initialize swarm for Supabase management
  mcp__ruv-swarm__swarm_init({
    topology: "hierarchical",
    maxAgents: 6,
    strategy: "specialized"
  })
  
  // Spawn specialized agents
  mcp__ruv-swarm__agent_spawn({
    type: "coordinator",
    name: "Supabase-Project-Manager"
  })
  
  mcp__ruv-swarm__agent_spawn({
    type: "coder", 
    name: "Database-Architect"
  })
  
  mcp__ruv-swarm__agent_spawn({
    type: "coder",
    name: "Function-Developer"
  })
  
  // Create new Supabase project
  mcp__supabase-admin__supabase_project_create({
    project_name: "saverly-marketplace",
    database_password: "SecurePassword123!",
    region: "us-east-1",
    plan: "pro"
  })
  
  // Initialize local project structure
  mcp__supabase-admin__supabase_project_init({
    project_path: "/Users/travisbailey/Claude Workspace/Saverly",
    // project_ref will be from creation response
  })
```

```javascript
// === STEP 2: DATABASE SCHEMA SETUP ===
[BatchTool - Database Architecture]:
  // Create comprehensive migration
  mcp__supabase-admin__supabase_migration_create({
    migration_name: "001_initial_saverly_schema",
    sql_content: `
      -- Enable extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "postgis";
      
      -- Create all Saverly tables with full schema
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
        subscription_status TEXT DEFAULT 'inactive',
        stripe_customer_id TEXT UNIQUE,
        stripe_subscription_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Businesses table
      CREATE TABLE public.businesses (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        phone TEXT,
        email TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Coupons table
      CREATE TABLE public.coupons (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        business_id UUID REFERENCES businesses(id) NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        discount_amount TEXT NOT NULL,
        usage_limit_type TEXT DEFAULT 'once',
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Redemptions table
      CREATE TABLE public.redemptions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES profiles(id) NOT NULL,
        coupon_id UUID REFERENCES coupons(id) NOT NULL,
        business_id UUID REFERENCES businesses(id) NOT NULL,
        qr_code TEXT UNIQUE NOT NULL,
        display_code TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        redeemed_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
      ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
      ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
        
      CREATE POLICY "Anyone can view active businesses" ON businesses
        FOR SELECT USING (active = true);
        
      -- Add indexes for performance
      CREATE INDEX profiles_subscription_status_idx ON profiles(subscription_status);
      CREATE INDEX businesses_location_idx ON businesses(latitude, longitude);
      CREATE INDEX coupons_business_active_idx ON coupons(business_id, active);
    `
  })
  
  // Apply the migration
  mcp__supabase-admin__supabase_migration_apply({})
```

```javascript
// === STEP 3: EDGE FUNCTIONS SETUP ===
[BatchTool - Functions Deployment]:
  // Create Stripe webhook function
  mcp__supabase-admin__supabase_function_create({
    function_name: "stripe-webhook",
    function_code: `
      import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
      import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
      import Stripe from 'https://esm.sh/stripe@14.21.0'
      
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string)
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      serve(async (req) => {
        const signature = req.headers.get('Stripe-Signature')
        const body = await req.text()
        
        try {
          const event = stripe.webhooks.constructEvent(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
          )
          
          // Handle subscription events
          if (event.type === 'customer.subscription.created' || 
              event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription
            
            await supabase
              .from('profiles')
              .update({
                subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer as string
              })
              .eq('stripe_customer_id', subscription.customer as string)
          }
          
          return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          })
        } catch (error) {
          return new Response('Webhook error', { status: 400 })
        }
      })
    `
  })
  
  // Set environment secrets
  mcp__supabase-admin__supabase_secrets_set({
    secrets: {
      "STRIPE_SECRET_KEY": "sk_live_extracted_from_base44",
      "STRIPE_WEBHOOK_SECRET": "whsec_your_webhook_secret"
    }
  })
  
  // Deploy all functions
  mcp__supabase-admin__supabase_function_deploy({})
```

```javascript
// === STEP 4: FINAL DEPLOYMENT & TESTING ===
[BatchTool - Production Ready]:
  // Deploy everything
  mcp__supabase-admin__supabase_deploy_all({})
  
  // Test with sample data
  mcp__supabase-admin__supabase_query({
    table: "businesses",
    operation: "insert",
    data: {
      name: "Test Coffee Shop",
      description: "Sample business for testing",
      category: "Food & Beverage",
      address: "123 Test St",
      city: "San Francisco",
      state: "CA",
      latitude: 37.7749,
      longitude: -122.4194,
      email: "test@coffee.com"
    }
  })
  
  // Verify setup
  mcp__supabase-admin__supabase_project_status({
    include_metrics: true
  })
  
  // Store project info in swarm memory
  mcp__ruv-swarm__memory_usage({
    action: "store",
    key: "supabase/project_setup",
    value: {
      project_name: "saverly-marketplace",
      setup_completed: new Date().toISOString(),
      tables_created: ["profiles", "businesses", "coupons", "redemptions"],
      functions_deployed: ["stripe-webhook"],
      status: "production_ready"
    }
  })
```

## 🎯 Benefits of This Setup

### ✅ **Complete Autonomy**
- Claude Flow can create, configure, and deploy entire Supabase projects
- No manual intervention needed for database setup
- Automated schema migrations and rollbacks

### ✅ **GitHub-Level Integration**
- Same level of control as GitHub MCP
- Full project lifecycle management
- Automated deployments and monitoring

### ✅ **Production Ready**
- Proper RLS policies and security
- Performance optimized indexes
- Environment secrets management
- Edge Functions with webhook handling

### ✅ **Saverly Optimized**
- Pre-configured for coupon marketplace
- QR code redemption system ready
- Stripe subscription handling
- Location-based queries with PostGIS

## 🚀 Getting Started

1. **Run the Prerequisites** (CLI install, auth, build)
2. **Replace MCP Server** with admin version
3. **Use Claude Flow** to create your project:

```javascript
// Single command to set up entire Saverly project
mcp__ruv-swarm__task_orchestrate({
  task: "Set up complete Saverly Supabase project from scratch",
  strategy: "sequential", // For proper setup order
  priority: "high"
})
```

Claude Flow will now have **complete control** over your Supabase infrastructure! 🎯
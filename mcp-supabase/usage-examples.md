# 🎯 Supabase MCP - Real-World Usage Examples

## 🏢 **Business Management Examples**

### Add New Restaurant Chain
```javascript
// Add multiple restaurant locations
mcp__supabase__database_query({
  table: "businesses",
  operation: "insert",
  data: [
    {
      name: "Pizza Palace - Downtown",
      description: "Authentic Italian pizza",
      category: "Food & Beverage",
      address: "123 Main St",
      city: "San Francisco", 
      state: "CA",
      zip_code: "94105",
      latitude: 37.7749,
      longitude: -122.4194,
      phone: "555-0101",
      email: "downtown@pizzapalace.com",
      contact_name: "Marco Romano"
    },
    {
      name: "Pizza Palace - Marina",
      description: "Authentic Italian pizza", 
      category: "Food & Beverage",
      address: "456 Bay St",
      city: "San Francisco",
      state: "CA", 
      zip_code: "94123",
      latitude: 37.8044,
      longitude: -122.4418,
      phone: "555-0102",
      email: "marina@pizzapalace.com",
      contact_name: "Sofia Romano"
    }
  ]
})
```

### Update Business Information
```javascript
// Update business hours and contact info
mcp__supabase__database_query({
  table: "businesses",
  operation: "update",
  data: {
    phone: "555-0199",
    description: "Authentic Italian pizza - Now with gluten-free options!",
    updated_at: new Date().toISOString()
  },
  filters: { 
    name: { like: "Pizza Palace%" }
  }
})
```

## 👥 **User Management Examples**

### Bulk User Registration
```javascript
// Add multiple users via authentication
[BatchTool]:
  mcp__supabase__auth({
    operation: "sign_up",
    email: "john.doe@gmail.com", 
    password: "securePass123",
    user_data: {
      full_name: "John Doe",
      phone: "555-1001",
      address: "789 Oak Ave",
      city: "San Francisco",
      state: "CA",
      zip_code: "94110"
    }
  })
  
  mcp__supabase__auth({
    operation: "sign_up",
    email: "jane.smith@yahoo.com",
    password: "anotherSecure456", 
    user_data: {
      full_name: "Jane Smith",
      phone: "555-1002",
      address: "321 Pine St", 
      city: "Oakland",
      state: "CA",
      zip_code: "94601"
    }
  })
```

### Query Users by Location and Status
```javascript
// Find all active subscribers in SF
mcp__supabase__database_query({
  table: "profiles",
  operation: "select",
  columns: "id, full_name, email, phone, address, subscription_status, created_at",
  filters: {
    city: "San Francisco",
    subscription_status: "active"
  },
  limit: 100
})

// Find users who joined in the last 30 days
mcp__supabase__database_query({
  table: "profiles", 
  operation: "select",
  columns: "full_name, email, city, created_at",
  filters: {
    created_at: { 
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
})
```

### Update User Subscriptions
```javascript
// Activate user subscription
mcp__supabase__database_query({
  table: "profiles",
  operation: "update", 
  data: {
    subscription_status: "active",
    subscription_plan: "monthly",
    subscription_period_start: new Date().toISOString(),
    subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_customer_id: "cus_stripe123"
  },
  filters: { 
    email: "john.doe@gmail.com"
  }
})
```

## 🎟️ **Coupon Management Examples**

### Create Promotional Campaign
```javascript
// Add multiple coupons for a promotional campaign
mcp__supabase__database_query({
  table: "coupons",
  operation: "insert",
  data: [
    {
      business_id: "pizza-palace-downtown-uuid",
      title: "Happy Hour Special",
      description: "50% off all pizzas 3-6 PM",
      discount_amount: "50%", 
      usage_limit_type: "daily",
      start_date: "2025-01-25T15:00:00Z",
      end_date: "2025-02-25T18:00:00Z",
      terms: "Valid 3-6 PM only. Dine-in only.",
      active: true
    },
    {
      business_id: "pizza-palace-marina-uuid",
      title: "Weekend Family Deal",
      description: "Buy 2 large pizzas, get 1 free", 
      discount_amount: "33%",
      usage_limit_type: "once",
      start_date: "2025-01-25T00:00:00Z",
      end_date: "2025-03-01T23:59:59Z",
      terms: "Weekends only. Family of 4+ required.",
      active: true
    }
  ]
})
```

### Query Available Coupons
```javascript
// Get all active coupons for Food & Beverage category
mcp__supabase__database_query({
  table: "coupons",
  operation: "select",
  columns: `
    coupons.id, coupons.title, coupons.description, 
    coupons.discount_amount, coupons.end_date,
    businesses.name as business_name, 
    businesses.address, businesses.category
  `,
  // Note: JOIN would need to be implemented in MCP server
  filters: {
    active: true,
    end_date: { gte: new Date().toISOString() }
  }
})
```

## 🔄 **Real-Time Operations Examples**

### Monitor Coupon Redemptions
```javascript
// Listen for coupon redemptions in real-time
mcp__supabase__realtime_listen({
  table: "redemptions",
  event: "INSERT",
  duration: 300000, // 5 minutes
  filter: "status=eq.pending"
})

// Process redemption updates
mcp__supabase__realtime_listen({
  table: "redemptions", 
  event: "UPDATE",
  duration: 300000,
  filter: "status=eq.redeemed"
})
```

### Live Subscription Changes
```javascript
// Monitor subscription status changes
mcp__supabase__realtime_listen({
  table: "profiles",
  event: "UPDATE", 
  duration: 600000, // 10 minutes
  filter: "subscription_status=neq.null"
})
```

## 📊 **Analytics & Reporting Examples**

### Business Performance Dashboard
```javascript
// Get comprehensive business metrics
[BatchTool]:
  // Total active businesses
  mcp__supabase__database_query({
    table: "businesses",
    operation: "select", 
    columns: "COUNT(*) as total_active",
    filters: { active: true }
  })
  
  // Coupons by business
  mcp__supabase__database_query({
    table: "coupons",
    operation: "select",
    columns: "business_id, COUNT(*) as coupon_count",
    filters: { active: true }
    // Would need GROUP BY in MCP implementation
  })
  
  // Recent redemptions
  mcp__supabase__database_query({
    table: "redemptions",
    operation: "select",
    columns: "*",
    filters: {
      created_at: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    },
    limit: 100
  })
  
  // System analytics
  mcp__supabase__analytics({
    metric: "user_activity",
    time_range: "24h"
  })
```

### User Engagement Analysis
```javascript
// Analyze user engagement patterns
mcp__supabase__database_query({
  table: "redemptions",
  operation: "select",
  columns: "user_id, COUNT(*) as total_redemptions, MAX(created_at) as last_redemption",
  // GROUP BY user_id - would need implementation
  filters: {
    status: "redeemed",
    created_at: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
})
```

## 🔧 **Database Administration Examples**

### Schema Inspection
```javascript
// Get complete database schema
[BatchTool]:
  mcp__supabase__schema({
    operation: "list_tables"
  })
  
  mcp__supabase__schema({
    operation: "describe_table",
    table_name: "profiles"
  })
  
  mcp__supabase__schema({
    operation: "describe_table", 
    table_name: "businesses"
  })
  
  mcp__supabase__schema({
    operation: "describe_table",
    table_name: "coupons"
  })
  
  mcp__supabase__schema({
    operation: "describe_table",
    table_name: "redemptions"
  })
```

### Data Maintenance
```javascript
// Clean up expired coupons
mcp__supabase__database_query({
  table: "coupons",
  operation: "update",
  data: { active: false },
  filters: {
    end_date: { lt: new Date().toISOString() },
    active: true
  }
})

// Remove old test accounts
mcp__supabase__database_query({
  table: "profiles",
  operation: "delete",
  filters: {
    email: { like: "test+%" },
    created_at: {
      lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
})
```

## 🎯 **Claude Flow Integration Examples**

### Coordinated Data Import
```javascript
// Multi-agent data import workflow
[BatchTool]:
  mcp__ruv-swarm__swarm_init({
    topology: "hierarchical",
    maxAgents: 4,
    strategy: "parallel"
  })
  
  mcp__ruv-swarm__agent_spawn({
    type: "coder", 
    name: "Business-Importer"
  })
  
  mcp__ruv-swarm__agent_spawn({
    type: "coder",
    name: "Coupon-Creator"
  })
  
  mcp__ruv-swarm__agent_spawn({
    type: "analyst",
    name: "Data-Validator"
  })
  
  // Store import context
  mcp__ruv-swarm__memory_usage({
    action: "store", 
    key: "import/session_" + Date.now(),
    value: {
      import_type: "restaurant_chain",
      total_businesses: 5,
      coupons_per_business: 3,
      validation_required: true
    }
  })
```

### Automated Reporting Swarm
```javascript
// Create automated business intelligence reports
[BatchTool]:
  mcp__ruv-swarm__task_orchestrate({
    task: "Generate comprehensive business performance report",
    strategy: "parallel", 
    priority: "medium"
  })
  
  // Parallel data collection
  mcp__supabase__database_query({
    table: "businesses",
    operation: "select",
    columns: "*",
    filters: { active: true }
  })
  
  mcp__supabase__database_query({
    table: "redemptions", 
    operation: "select",
    columns: "*",
    filters: {
      created_at: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  })
  
  mcp__supabase__analytics({
    metric: "user_activity",
    time_range: "30d"
  })
```

## 💾 **File Storage Examples**

### Upload Business Assets
```javascript
// Upload business logo
mcp__supabase__storage({
  bucket: "business-assets",
  operation: "upload",
  file_path: "logos/pizza-palace-downtown.png",
  file_data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // base64
  options: {
    contentType: "image/png",
    cacheControl: "3600"
  }
})

// List all business logos
mcp__supabase__storage({
  bucket: "business-assets",
  operation: "list", 
  file_path: "logos/"
})
```

### Manage Coupon Images
```javascript
// Upload coupon promotional image
mcp__supabase__storage({
  bucket: "coupon-images",
  operation: "upload",
  file_path: "promos/happy-hour-special.jpg", 
  file_data: "base64-encoded-image-data-here",
  options: {
    contentType: "image/jpeg"
  }
})
```

These examples demonstrate the full spectrum of database operations, user management, real-time monitoring, and Claude Flow integration that the Supabase MCP server provides for your Saverly marketplace application.
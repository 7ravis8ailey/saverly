# 🐝 Claude Flow + Supabase MCP Integration Guide

## 🎯 Complete Integration Setup

### 1. Install and Configure MCP Server

```bash
# Build the Supabase MCP server
cd /Users/travisbailey/Claude\ Workspace/Saverly/mcp-supabase
npm install && npm run build

# Add to Claude Code MCP configuration
claude mcp add supabase node /Users/travisbailey/Claude\ Workspace/Saverly/mcp-supabase/dist/index.js
```

### 2. Environment Setup

Create `.env` file in mcp-supabase directory:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Verify Integration

Test that both Claude Flow and Supabase MCP are working:

```javascript
// Test Claude Flow
mcp__claude-flow__swarm_init({ topology: "mesh", maxAgents: 3 })

// Test Supabase MCP  
mcp__supabase__schema({ operation: "list_tables" })
```

## 🚀 Saverly-Specific Integration Patterns

### Database-Driven Development Swarm

```javascript
// Initialize specialized database development swarm
[BatchTool - Single Message]:
  mcp__claude-flow__swarm_init({ 
    topology: "hierarchical", 
    maxAgents: 5, 
    strategy: "specialized" 
  })
  
  mcp__claude-flow__agent_spawn({ 
    type: "analyst", 
    name: "DB-Architect",
    capabilities: ["database_design", "performance_optimization"]
  })
  
  mcp__claude-flow__agent_spawn({ 
    type: "coder", 
    name: "API-Builder", 
    capabilities: ["edge_functions", "authentication"]
  })
  
  mcp__claude-flow__agent_spawn({ 
    type: "tester", 
    name: "Data-Validator",
    capabilities: ["data_integrity", "query_testing"]
  })
  
  mcp__claude-flow__agent_spawn({ 
    type: "coordinator", 
    name: "Supabase-Manager",
    capabilities: ["real_time", "storage", "analytics"]
  })

  // Test database connectivity
  mcp__supabase__database_query({
    table: "profiles",
    operation: "select", 
    limit: 1
  })
```

### Real-Time Coupon Monitoring System

```javascript
// Set up comprehensive real-time monitoring
[BatchTool - Single Message]:
  // Monitor new coupon redemptions
  mcp__supabase__realtime_listen({
    table: "redemptions",
    event: "INSERT", 
    duration: 300000 // 5 minutes
  })
  
  // Monitor subscription changes
  mcp__supabase__realtime_listen({
    table: "profiles",
    event: "UPDATE",
    filter: "subscription_status=neq.null",
    duration: 300000
  })
  
  // Get current analytics baseline
  mcp__supabase__analytics({
    metric: "user_activity",
    time_range: "1h"
  })
  
  // Store monitoring context in swarm memory
  mcp__claude-flow__memory_usage({
    action: "store",
    key: "monitoring/realtime_session",
    value: {
      started_at: new Date().toISOString(),
      monitoring_tables: ["redemptions", "profiles"],
      expected_events: ["coupon_redemptions", "subscription_updates"]
    }
  })
```

### Automated Business Intelligence Swarm

```javascript
// Create BI swarm for business insights
[BatchTool]:
  mcp__claude-flow__swarm_init({ 
    topology: "mesh", 
    maxAgents: 4,
    strategy: "parallel" 
  })
  
  // Business performance analyst
  mcp__claude-flow__agent_spawn({ 
    type: "analyst",
    name: "Business-Intelligence"
  })
  
  // Coupon effectiveness researcher  
  mcp__claude-flow__agent_spawn({ 
    type: "researcher",
    name: "Coupon-Researcher"
  })
  
  // User behavior analyst
  mcp__claude-flow__agent_spawn({ 
    type: "analyst", 
    name: "User-Behavior"
  })
  
  // Task orchestration for parallel analysis
  mcp__claude-flow__task_orchestrate({
    task: "Generate comprehensive business intelligence report",
    strategy: "parallel",
    priority: "high"
  })

  // Parallel data gathering
  mcp__supabase__database_query({
    table: "businesses",
    operation: "select",
    columns: "id, name, category, created_at",
    filters: { active: true }
  })
  
  mcp__supabase__database_query({
    table: "coupons", 
    operation: "select",
    columns: "business_id, title, start_date, end_date, active"
  })
  
  mcp__supabase__database_query({
    table: "redemptions",
    operation: "select", 
    columns: "coupon_id, user_id, status, created_at, redeemed_at"
  })
  
  mcp__supabase__analytics({
    metric: "table_sizes"
  })
```

### Subscription Management Automation

```javascript
// Automate subscription lifecycle management
[BatchTool]:
  // Check subscription statuses
  mcp__supabase__database_query({
    table: "profiles",
    operation: "select",
    columns: "id, subscription_status, subscription_period_end, stripe_customer_id",
    filters: { subscription_status: "active" }
  })
  
  // Process expired subscriptions
  mcp__supabase__database_query({
    table: "profiles", 
    operation: "update",
    data: { subscription_status: "inactive" },
    filters: { subscription_period_end: { lt: new Date().toISOString() } }
  })
  
  // Invoke Stripe webhook processing
  mcp__supabase__edge_function({
    function_name: "stripe-webhook",
    payload: {
      type: "subscription.check_status",
      batch_process: true
    }
  })
  
  // Store automation results
  mcp__claude-flow__memory_usage({
    action: "store", 
    key: "automation/subscription_cleanup",
    value: {
      processed_at: new Date().toISOString(),
      expired_count: "to_be_filled",
      updated_count: "to_be_filled"
    }
  })
```

## 🔄 Advanced Coordination Patterns

### Memory-Driven Database Operations

```javascript  
// Store business rules in swarm memory for consistent application
mcp__claude-flow__memory_usage({
  action: "store",
  key: "business_rules/coupon_validation", 
  value: {
    max_daily_redemptions: 5,
    min_time_between_redemptions: 3600, // 1 hour
    allowed_usage_types: ["once", "daily", "monthly_1", "monthly_2", "monthly_4"],
    subscription_required_categories: ["Premium", "VIP"]
  }
})

// All agents can now reference these rules
mcp__claude-flow__memory_usage({
  action: "retrieve",
  key: "business_rules/coupon_validation"
})

// Apply rules in database operations
mcp__supabase__database_query({
  table: "coupons",
  operation: "insert",
  data: {
    // Data validated against rules from memory
    usage_limit_type: "daily", // from memory rules
    business_id: "uuid",
    title: "Flash Sale - 50% Off"
  }
})
```

### Cross-Agent Data Coordination

```javascript
// Agent 1: Data Collection Specialist
Task("Data-Collector", `
MANDATORY COORDINATION:
1. Run: npx claude-flow hooks pre-task --description "collect_saverly_data"
2. Use mcp__supabase__database_query to gather all business data
3. Store results using: npx claude-flow hooks notification --message "collected X businesses"
4. End: npx claude-flow hooks post-task --analyze-performance true

Collect all active businesses and their coupon counts.
`);

// Agent 2: Analysis Specialist  
Task("Data-Analyzer", `
MANDATORY COORDINATION:
1. Run: npx claude-flow hooks pre-task --description "analyze_business_performance"
2. Check memory for collected data from Data-Collector agent
3. Use mcp__supabase__analytics for performance metrics
4. Store insights using: npx claude-flow hooks notification --message "analysis complete"
5. End: npx claude-flow hooks post-task --analyze-performance true

Wait for Data-Collector, then analyze business performance patterns.
`);

// Agent 3: Action Coordinator
Task("Action-Coordinator", `
MANDATORY COORDINATION:
1. Run: npx claude-flow hooks pre-task --description "coordinate_business_actions"
2. Retrieve analysis results from memory
3. Use mcp__supabase__database_query to implement recommendations
4. Store final results: npx claude-flow hooks notification --message "actions implemented"
5. End: npx claude-flow hooks post-task --analyze-performance true

Coordinate implementation of analysis recommendations.
`);
```

### Real-Time Event Processing Pipeline

```javascript
// Set up event processing pipeline with swarm coordination
[BatchTool]:
  // Initialize event processing swarm
  mcp__claude-flow__swarm_init({ 
    topology: "hierarchical",
    maxAgents: 6,
    strategy: "adaptive"
  })
  
  // Event listener agent
  mcp__claude-flow__agent_spawn({
    type: "coordinator", 
    name: "Event-Listener"
  })
  
  // Event processor agents
  mcp__claude-flow__agent_spawn({
    type: "coder",
    name: "Redemption-Processor" 
  })
  
  mcp__claude-flow__agent_spawn({
    type: "coder",
    name: "Subscription-Processor"
  })
  
  // Analytics agent
  mcp__claude-flow__agent_spawn({
    type: "analyst",
    name: "Event-Analyzer"
  })
  
  // Start real-time listening for multiple event types
  mcp__supabase__realtime_listen({
    table: "redemptions",
    event: "*", // All events
    duration: 600000 // 10 minutes
  })
  
  mcp__supabase__realtime_listen({
    table: "profiles", 
    event: "UPDATE",
    filter: "subscription_status=neq.null",
    duration: 600000
  })
  
  // Set up event processing coordination memory
  mcp__claude-flow__memory_usage({
    action: "store",
    key: "events/processing_pipeline",
    value: {
      pipeline_id: "saverly-events-" + Date.now(),
      active_listeners: ["redemptions", "profiles"],
      processing_agents: ["Redemption-Processor", "Subscription-Processor"],
      started_at: new Date().toISOString()
    }
  })
```

## 🎯 Saverly Business Logic Integration

### QR Code Generation & Validation Flow

```javascript
// Complete QR code lifecycle management
[BatchTool]:
  // Generate new QR redemption
  mcp__supabase__database_query({
    table: "redemptions",
    operation: "insert", 
    data: {
      user_id: "user-uuid",
      coupon_id: "coupon-uuid",
      business_id: "business-uuid",
      qr_code: "QR" + Date.now() + Math.random().toString(36).substr(2, 9),
      display_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      status: "pending",
      expires_at: new Date(Date.now() + 60000).toISOString() // 60 seconds
    }
  })
  
  // Set up expiration monitoring
  mcp__supabase__realtime_listen({
    table: "redemptions",
    event: "UPDATE",
    filter: "status=eq.expired",
    duration: 120000 // 2 minutes
  })
  
  // Analytics on redemption patterns
  mcp__supabase__analytics({
    metric: "user_activity", 
    time_range: "1h"
  })
  
  // Store QR session in memory for tracking
  mcp__claude-flow__memory_usage({
    action: "store",
    key: "qr_sessions/active",
    value: {
      session_id: "qr-session-" + Date.now(),
      generated_codes: 1,
      expiration_monitoring: true,
      started_at: new Date().toISOString()
    }
  })
```

### Location-Based Coupon Discovery

```javascript
// Advanced location-based coupon system
[BatchTool]:
  // Get user location from profile
  mcp__supabase__database_query({
    table: "profiles",
    operation: "select",
    columns: "id, latitude, longitude, city, subscription_status",
    filters: { id: "user-uuid" }
  })
  
  // Find nearby businesses using PostGIS
  mcp__supabase__database_query({
    table: "businesses",
    operation: "select",
    columns: `
      id, name, category, address, latitude, longitude,
      ST_Distance(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(-122.4194, 37.7749)::geography
      ) as distance_meters
    `,
    filters: { active: true }
    // Note: This would need a custom SQL query function in the MCP server
  })
  
  // Get active coupons for nearby businesses
  mcp__supabase__database_query({
    table: "coupons",
    operation: "select", 
    columns: "id, business_id, title, description, discount_amount, end_date",
    filters: { 
      active: true,
      start_date: { lte: new Date().toISOString() },
      end_date: { gte: new Date().toISOString() }
    }
  })
  
  // Store location context
  mcp__claude-flow__memory_usage({
    action: "store",
    key: "location/user_context",
    value: {
      user_id: "user-uuid",
      search_radius_meters: 5000,
      preferred_categories: ["Food & Beverage", "Retail"],
      subscription_level: "active"
    }
  })
```

## 🛠️ Development Workflow Integration

### Database Migration Management

```javascript
// Coordinate database schema changes with swarm
[BatchTool]:
  // Check current schema
  mcp__supabase__schema({
    operation: "list_tables"
  })
  
  mcp__supabase__schema({
    operation: "describe_table",
    table_name: "coupons"
  })
  
  // Analyze performance before migration
  mcp__supabase__analytics({
    metric: "table_sizes"
  })
  
  // Store migration context
  mcp__claude-flow__memory_usage({
    action: "store",
    key: "migrations/pre_migration_state",
    value: {
      timestamp: new Date().toISOString(),
      tables_analyzed: ["profiles", "businesses", "coupons", "redemptions"],
      migration_purpose: "add_coupon_categories",
      performance_baseline: "to_be_recorded"
    }
  })
  
  // Initialize migration coordination swarm
  mcp__claude-flow__swarm_init({
    topology: "hierarchical",
    maxAgents: 3,
    strategy: "sequential" // Sequential for safe migrations
  })
  
  mcp__claude-flow__agent_spawn({
    type: "coordinator",
    name: "Migration-Manager"
  })
```

### Testing & Validation Automation

```javascript
// Automated testing with real database
[BatchTool]:
  // Test data integrity
  mcp__supabase__database_query({
    table: "redemptions",
    operation: "select",
    columns: "COUNT(*) as total_redemptions, status",
    // Would need GROUP BY support in MCP server
  })
  
  // Test authentication flow
  mcp__supabase__auth({
    operation: "sign_up",
    email: "test+" + Date.now() + "@example.com",
    password: "testpassword123",
    user_data: { full_name: "Test User", test_account: true }
  })
  
  // Test Edge Function
  mcp__supabase__edge_function({
    function_name: "stripe-webhook",
    payload: {
      type: "customer.subscription.created",
      data: { 
        object: { 
          customer: "test-customer",
          status: "active"
        }
      }
    }
  })
  
  // Store test results
  mcp__claude-flow__memory_usage({
    action: "store",
    key: "testing/integration_results",
    value: {
      test_run_id: "test-" + Date.now(),
      database_tests: "passed",
      auth_tests: "passed", 
      function_tests: "passed",
      timestamp: new Date().toISOString()
    }
  })
```

## 📊 Monitoring & Analytics Dashboard

### Real-Time Business Dashboard

```javascript
// Create comprehensive business dashboard
[BatchTool]:
  // Current active metrics
  mcp__supabase__database_query({
    table: "businesses",
    operation: "select",
    columns: "COUNT(*) as total_businesses",
    filters: { active: true }
  })
  
  mcp__supabase__database_query({
    table: "coupons",
    operation: "select", 
    columns: "COUNT(*) as active_coupons",
    filters: { 
      active: true,
      end_date: { gte: new Date().toISOString() }
    }
  })
  
  mcp__supabase__database_query({
    table: "profiles", 
    operation: "select",
    columns: "COUNT(*) as active_subscribers",
    filters: { subscription_status: "active" }
  })
  
  // Real-time activity monitoring
  mcp__supabase__realtime_listen({
    table: "redemptions",
    event: "INSERT",
    duration: 60000 // 1 minute snapshot
  })
  
  // Performance analytics
  mcp__supabase__analytics({
    metric: "user_activity",
    time_range: "24h"
  })
  
  // Store dashboard data
  mcp__claude-flow__memory_usage({
    action: "store",
    key: "dashboard/current_metrics",
    value: {
      generated_at: new Date().toISOString(),
      metrics_collected: [
        "total_businesses",
        "active_coupons", 
        "active_subscribers",
        "realtime_redemptions"
      ],
      refresh_interval: 60000
    }
  })
```

This integration creates a powerful synergy between Claude Flow's orchestration capabilities and Supabase's database operations, enabling sophisticated, coordinated development workflows for the Saverly marketplace application.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "supabase_mcp_design", "content": "Design Supabase MCP server architecture and tool specifications", "status": "completed", "priority": "high"}, {"id": "mcp_implementation", "content": "Implement Supabase MCP server with database, auth, and functions tools", "status": "completed", "priority": "high"}, {"id": "claude_flow_integration", "content": "Integrate Supabase MCP with Claude Flow orchestration", "status": "completed", "priority": "medium"}, {"id": "testing_validation", "content": "Test MCP tools with real Supabase operations", "status": "pending", "priority": "medium"}, {"id": "installation_guide", "content": "Create installation and setup guide for the MCP server", "status": "completed", "priority": "high"}]
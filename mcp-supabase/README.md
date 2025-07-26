# 🗄️ Supabase MCP Server for Claude Flow

A Model Context Protocol (MCP) server that provides comprehensive Supabase integration for Claude Flow orchestration.

## 🚀 Features

### 📊 Database Operations
- **CRUD Operations**: SELECT, INSERT, UPDATE, DELETE, UPSERT with advanced filtering
- **Complex Queries**: Join operations, aggregations, and custom SQL
- **Transaction Support**: Atomic operations across multiple tables
- **Performance Monitoring**: Query optimization and execution metrics

### 🔐 Authentication Management
- **User Lifecycle**: Sign up, sign in, sign out operations
- **Profile Management**: Update user data and metadata
- **Session Handling**: Token management and refresh
- **Role-Based Access**: User permissions and role assignments

### ⚡ Edge Functions
- **Function Invocation**: Call Supabase Edge Functions with payloads
- **Custom Headers**: Set authentication and custom headers
- **Error Handling**: Comprehensive error reporting and debugging
- **Async Processing**: Non-blocking function calls

### 🔄 Real-time Subscriptions
- **Database Changes**: Listen to INSERT, UPDATE, DELETE events
- **Filtered Subscriptions**: Subscribe to specific rows or conditions
- **Event Streaming**: Real-time data synchronization
- **Connection Management**: Automatic reconnection and cleanup

### 📁 Storage Operations
- **File Upload/Download**: Binary file handling with base64 encoding
- **Bucket Management**: Create and manage storage buckets
- **File Metadata**: Access file information and permissions
- **Batch Operations**: Multiple file operations in single calls

### 📈 Analytics & Monitoring
- **Performance Metrics**: Database query performance and optimization
- **Usage Statistics**: User activity and engagement metrics
- **Storage Analytics**: File usage and storage consumption
- **Custom Dashboards**: Create business-specific analytics

### 🏗️ Schema Management
- **Table Introspection**: View table structures and relationships
- **Policy Management**: Row Level Security (RLS) policy operations
- **Migration Support**: Schema versioning and migration tracking
- **Index Optimization**: Performance index recommendations

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
cd mcp-supabase
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Build the Server
```bash
npm run build
```

### 4. Add to Claude Code MCP Configuration

Add to your `~/.claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["/Users/travisbailey/Claude Workspace/Saverly/mcp-supabase/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

Or add via Claude Code CLI:
```bash
claude mcp add supabase node /Users/travisbailey/Claude\ Workspace/Saverly/mcp-supabase/dist/index.js
```

## 📚 Tool Usage Examples

### Database Operations
```javascript
// Select users with subscription status
mcp__supabase__database_query({
  table: "profiles",
  operation: "select",
  columns: "id, full_name, subscription_status",
  filters: { subscription_status: "active" },
  limit: 50
})

// Insert new coupon
mcp__supabase__database_query({
  table: "coupons",  
  operation: "insert",
  data: {
    business_id: "uuid-here",
    title: "20% Off Coffee",
    description: "Valid until end of month",
    discount_amount: "20%",
    start_date: "2025-01-01T00:00:00Z",
    end_date: "2025-01-31T23:59:59Z"
  }
})

// Update redemption status
mcp__supabase__database_query({
  table: "redemptions",
  operation: "update", 
  data: { status: "redeemed", redeemed_at: "2025-01-25T10:30:00Z" },
  filters: { qr_code: "QR12345" }
})
```

### Authentication
```javascript
// Create new user
mcp__supabase__auth({
  operation: "sign_up",
  email: "user@example.com",
  password: "securepassword",
  user_data: {
    full_name: "John Doe",
    city: "San Francisco"
  }
})

// Get current user
mcp__supabase__auth({
  operation: "get_user"
})
```

### Edge Functions
```javascript
// Process Stripe webhook
mcp__supabase__edge_function({
  function_name: "stripe-webhook",
  payload: {
    type: "customer.subscription.created",
    data: { /* webhook data */ }
  },
  headers: {
    "stripe-signature": "webhook-signature"
  }
})
```

### Real-time Monitoring
```javascript
// Listen for new coupon redemptions
mcp__supabase__realtime_listen({
  table: "redemptions",
  event: "INSERT",
  filter: "status=eq.pending",
  duration: 60000 // 60 seconds
})
```

### Storage Operations  
```javascript
// Upload business logo
mcp__supabase__storage({
  bucket: "business-logos",
  operation: "upload",
  file_path: "business-123/logo.png",
  file_data: "iVBORw0KGgoAAAANSUhEUgAA..." // base64
})

// List coupon images
mcp__supabase__storage({
  bucket: "coupon-images", 
  operation: "list",
  file_path: "business-456/"
})
```

### Analytics
```javascript
// Get user activity metrics
mcp__supabase__analytics({
  metric: "user_activity",
  time_range: "7d"
})

// Check table sizes
mcp__supabase__analytics({
  metric: "table_sizes"
})
```

### Schema Management
```javascript
// List all tables
mcp__supabase__schema({
  operation: "list_tables"
})

// Describe coupons table structure
mcp__supabase__schema({
  operation: "describe_table",
  table_name: "coupons" 
})
```

## 🐝 Claude Flow Integration Patterns

### Swarm Database Coordination
```javascript
// Initialize database-focused swarm
mcp__claude-flow__swarm_init({ 
  topology: "mesh", 
  maxAgents: 4,
  strategy: "specialized" 
});

// Spawn database specialist agents
mcp__claude-flow__agent_spawn({ 
  type: "analyst", 
  name: "DB-Optimizer",
  capabilities: ["supabase_analytics", "supabase_schema"]
});

mcp__claude-flow__agent_spawn({ 
  type: "coordinator", 
  name: "Data-Manager",
  capabilities: ["supabase_database_query", "supabase_realtime_listen"]
});
```

### Parallel Data Operations
```javascript
// Batch tool for multiple database operations
[BatchTool]:
  mcp__supabase__database_query({ 
    table: "businesses", 
    operation: "select",
    filters: { active: true }
  })
  mcp__supabase__database_query({ 
    table: "coupons", 
    operation: "select",
    columns: "id, title, business_id, end_date",
    filters: { active: true }
  })
  mcp__supabase__analytics({ metric: "user_activity" })
  mcp__supabase__realtime_listen({ 
    table: "redemptions", 
    event: "INSERT",
    duration: 30000
  })
```

### Memory-Coordinated Data Flows
```javascript
// Store database insights in swarm memory
mcp__claude-flow__memory_usage({
  action: "store",
  key: "db/business_analysis",
  value: {
    active_businesses: 234,
    top_categories: ["Food & Beverage", "Retail"],
    avg_coupons_per_business: 3.2
  }
})

// Agents can reference stored data
mcp__claude-flow__memory_usage({
  action: "retrieve", 
  key: "db/business_analysis"
})
```

## 🔧 Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
```

### Type Checking
```bash
npm run typecheck
```

## 🛡️ Security Considerations

### Environment Variables
- Use `.env` files for local development
- Set environment variables in production deployments
- **Never commit** `.env` files to version control

### Authentication
- Use Service Role Key for admin operations
- Use Anon Key for public read operations
- Implement Row Level Security (RLS) policies

### Error Handling
- All database errors are caught and returned as structured responses
- Sensitive information is not exposed in error messages
- Validation errors provide helpful debugging information

## 🎯 Claude Flow Saverly Integration

This MCP server is specifically designed for the Saverly marketplace application:

### Business Operations
- **Business Management**: CRUD operations for businesses table
- **Location Queries**: PostGIS integration for distance-based searches
- **Category Filtering**: Efficient business category management

### Coupon Lifecycle
- **Coupon Creation**: Streamlined coupon creation with validation
- **Usage Tracking**: Monitor redemption patterns and limits
- **Expiration Management**: Automated expiration handling

### User & Subscription Management
- **Profile Management**: Complete user profile lifecycle
- **Subscription Tracking**: Stripe integration via Edge Functions
- **Analytics**: User engagement and subscription metrics

### Real-time Features
- **Live Redemptions**: Real-time coupon redemption monitoring
- **Business Notifications**: Live updates for business owners
- **Admin Dashboard**: Real-time analytics and monitoring

## 📊 Performance Optimization

### Database Indexing
- Automatically detects missing indexes
- Provides index recommendations
- Monitors query performance

### Connection Pooling
- Efficient connection management
- Automatic connection cleanup
- Connection pool monitoring

### Caching Strategies
- Built-in query result caching
- Configurable cache TTL
- Cache invalidation on data changes

## 🆘 Troubleshooting

### Common Issues

**Connection Errors**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check network connectivity to Supabase
- Ensure Supabase project is active

**Permission Errors**  
- Verify Row Level Security policies
- Check user authentication status
- Ensure proper role assignments

**Query Performance**
- Use `supabase_analytics` to identify slow queries
- Review database indexes
- Optimize filter conditions

### Debug Mode
Set `DEBUG=true` environment variable for detailed logging:

```bash
DEBUG=true npm run dev
```

## 🔗 Integration with Existing Tools

### GitHub MCP Integration
Works alongside GitHub MCP for complete development workflow:

```javascript
// Database schema changes + GitHub commit
mcp__supabase__schema({ operation: "describe_table", table_name: "coupons" })
mcp__github__create_commit({
  message: "Update coupons table schema",
  files: ["supabase/migrations/update_coupons.sql"]
})
```

### Notion MCP Integration  
Combine with Notion MCP for documentation:

```javascript
// Document database changes in Notion
mcp__supabase__analytics({ metric: "table_sizes" })
mcp__notion__update_page({
  page_id: "database-docs",
  content: "Updated table statistics..."
})
```

---

**🚀 Ready to supercharge your Supabase development with Claude Flow!**

This MCP server provides the missing link between Claude's intelligence and Supabase's powerful backend platform, enabling sophisticated database operations, real-time monitoring, and seamless integration with your Claude Flow orchestration.
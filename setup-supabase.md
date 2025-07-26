# 🚀 Complete Supabase Setup for Claude Flow

## ✅ What's Already Done

Your Supabase MCP is configured in `.mcp.json` with:
- **Project ID**: `lziayzusujlvhebyagdl` 
- **Project URL**: `https://lziayzusujlvhebyagdl.supabase.co`

## 🔑 Missing: Personal Access Token

You provided the **API Key** (anon key), but Claude Flow needs a **Personal Access Token** for full control.

### Get Your Personal Access Token:

1. Go to **https://supabase.com/dashboard/account/tokens**
2. Click **"Generate New Token"**
3. Name: `Claude Code MCP`
4. Copy the token (starts with `sbp_`)

### Update .mcp.json:

Replace this line in `/Users/travisbailey/Claude Workspace/Saverly/.mcp.json`:

```json
"SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
```

## 🗄️ Deploy Database Schema

Once you have the token, run this to deploy the Saverly database:

```bash
cd "/Users/travisbailey/Claude Workspace/Saverly"

# Set your access token
export SUPABASE_ACCESS_TOKEN="sbp_your_token_here"

# Link to your project  
supabase link --project-ref lziayzusujlvhebyagdl

# Deploy the database schema
supabase db push
```

## 🎯 Test Claude Flow + Supabase

After setup, test with:

```javascript
// Initialize Claude Flow swarm
mcp__ruv-swarm__swarm_init({
  topology: "mesh", 
  maxAgents: 4,
  strategy: "specialized"
})

// Test Supabase connection
mcp__supabase__query({
  sql: "SELECT current_database(), current_user, version()"
})

// Create sample business
mcp__supabase__insert_data({
  table: "businesses",
  data: {
    name: "Test Coffee Shop",
    category: "Food & Beverage",
    email: "test@coffee.com"
  }
})
```

## 🚨 Important Notes

1. **Keep your access token secure** - it gives full project access
2. **The anon key you provided** is for frontend client access
3. **Personal access token** is for admin/backend operations
4. **Restart Claude Code** after updating the token

Once you get the personal access token and update `.mcp.json`, Claude Flow will have **complete control** over your Supabase database! 🎯
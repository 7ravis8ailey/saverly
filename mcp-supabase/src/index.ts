#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Validation schemas
const DatabaseQuerySchema = z.object({
  table: z.string(),
  operation: z.enum(['select', 'insert', 'update', 'delete', 'upsert']),
  data: z.any().optional(),
  filters: z.record(z.any()).optional(),
  columns: z.string().optional(),
  limit: z.number().optional(),
});

const EdgeFunctionSchema = z.object({
  function_name: z.string(),
  payload: z.any().optional(),
  headers: z.record(z.string()).optional(),
});

const AuthOperationSchema = z.object({
  operation: z.enum(['sign_up', 'sign_in', 'sign_out', 'get_user', 'update_user']),
  email: z.string().email().optional(),
  password: z.string().optional(),
  user_data: z.any().optional(),
});

const RealtimeSchema = z.object({
  table: z.string(),
  event: z.enum(['INSERT', 'UPDATE', 'DELETE', '*']),
  filter: z.string().optional(),
  duration: z.number().default(30000), // 30 seconds default
});

const StorageSchema = z.object({
  bucket: z.string(),
  operation: z.enum(['upload', 'download', 'delete', 'list', 'create_bucket']),
  file_path: z.string().optional(),
  file_data: z.string().optional(), // base64 encoded
  options: z.any().optional(),
});

class SupabaseMCPServer {
  private server: Server;
  private supabase: SupabaseClient;

  constructor() {
    this.server = new Server(
      {
        name: 'supabase-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Database Operations
          {
            name: 'supabase_database_query',
            description: 'Execute database queries (SELECT, INSERT, UPDATE, DELETE, UPSERT)',
            inputSchema: {
              type: 'object',
              properties: {
                table: { type: 'string', description: 'Table name' },
                operation: { 
                  type: 'string', 
                  enum: ['select', 'insert', 'update', 'delete', 'upsert'],
                  description: 'Database operation type'
                },
                data: { type: 'object', description: 'Data for insert/update/upsert operations' },
                filters: { type: 'object', description: 'Filters for query (e.g., {id: 123, active: true})' },
                columns: { type: 'string', description: 'Columns to select (comma-separated)' },
                limit: { type: 'number', description: 'Limit number of results' }
              },
              required: ['table', 'operation']
            }
          },

          // Authentication
          {
            name: 'supabase_auth',
            description: 'Manage user authentication (sign up, sign in, get user, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  enum: ['sign_up', 'sign_in', 'sign_out', 'get_user', 'update_user'],
                  description: 'Authentication operation'
                },
                email: { type: 'string', description: 'User email' },
                password: { type: 'string', description: 'User password' },
                user_data: { type: 'object', description: 'Additional user metadata' }
              },
              required: ['operation']
            }
          },

          // Edge Functions
          {
            name: 'supabase_edge_function',
            description: 'Invoke Supabase Edge Functions',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: { type: 'string', description: 'Name of the Edge Function' },
                payload: { type: 'object', description: 'Payload to send to function' },
                headers: { type: 'object', description: 'Custom headers' }
              },
              required: ['function_name']
            }
          },

          // Real-time Subscriptions
          {
            name: 'supabase_realtime_listen',
            description: 'Listen to real-time database changes',
            inputSchema: {
              type: 'object',
              properties: {
                table: { type: 'string', description: 'Table to listen to' },
                event: { 
                  type: 'string', 
                  enum: ['INSERT', 'UPDATE', 'DELETE', '*'],
                  description: 'Event type to listen for'
                },
                filter: { type: 'string', description: 'Filter condition (e.g., "id=eq.123")' },
                duration: { type: 'number', description: 'Listen duration in milliseconds (default: 30000)' }
              },
              required: ['table', 'event']
            }
          },

          // Storage Operations
          {
            name: 'supabase_storage',
            description: 'Manage file storage operations',
            inputSchema: {
              type: 'object',
              properties: {
                bucket: { type: 'string', description: 'Storage bucket name' },
                operation: {
                  type: 'string',
                  enum: ['upload', 'download', 'delete', 'list', 'create_bucket'],
                  description: 'Storage operation'
                },
                file_path: { type: 'string', description: 'File path in bucket' },
                file_data: { type: 'string', description: 'Base64 encoded file data for upload' },
                options: { type: 'object', description: 'Additional options' }
              },
              required: ['bucket', 'operation']
            }
          },

          // Analytics & Monitoring
          {
            name: 'supabase_analytics',
            description: 'Get database analytics and performance metrics',
            inputSchema: {
              type: 'object',
              properties: {
                metric: {
                  type: 'string',
                  enum: ['table_sizes', 'query_performance', 'user_activity', 'storage_usage'],
                  description: 'Analytics metric to retrieve'
                },
                table_name: { type: 'string', description: 'Specific table name (optional)' },
                time_range: { type: 'string', description: 'Time range (e.g., "24h", "7d", "30d")' }
              },
              required: ['metric']
            }
          },

          // Schema Management
          {
            name: 'supabase_schema',
            description: 'Manage database schema (tables, columns, policies)',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  enum: ['list_tables', 'describe_table', 'list_policies', 'create_policy'],
                  description: 'Schema operation'
                },
                table_name: { type: 'string', description: 'Table name for specific operations' },
                policy_definition: { type: 'object', description: 'RLS policy definition' }
              },
              required: ['operation']
            }
          }
        ] as Tool[]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'supabase_database_query':
            return await this.handleDatabaseQuery(args);
          
          case 'supabase_auth':
            return await this.handleAuth(args);
          
          case 'supabase_edge_function':
            return await this.handleEdgeFunction(args);
          
          case 'supabase_realtime_listen':
            return await this.handleRealtimeListener(args);
          
          case 'supabase_storage':
            return await this.handleStorage(args);
          
          case 'supabase_analytics':
            return await this.handleAnalytics(args);
          
          case 'supabase_schema':
            return await this.handleSchema(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: false
        };
      }
    });
  }

  private async handleDatabaseQuery(args: any): Promise<CallToolResult> {
    const params = DatabaseQuerySchema.parse(args);
    const { table, operation, data, filters, columns, limit } = params;

    let result: any;
    let error: any;

    switch (operation) {
      case 'select':
        let selectQuery = this.supabase.from(table).select(columns || '*');
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            selectQuery = selectQuery.eq(key, value);
          });
        }
        
        if (limit) selectQuery = selectQuery.limit(limit);
        
        const selectResult = await selectQuery;
        result = selectResult.data;
        error = selectResult.error;
        break;

      case 'insert':
        if (!data) throw new Error('Data is required for insert operation');
        const insertResult = await this.supabase.from(table).insert(data);
        result = insertResult.data;
        error = insertResult.error;
        break;

      case 'update':
        if (!data) throw new Error('Data is required for update operation');
        let updateQuery = this.supabase.from(table).update(data);
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            updateQuery = updateQuery.eq(key, value);
          });
        }
        
        const updateResult = await updateQuery;
        result = updateResult.data;
        error = updateResult.error;
        break;

      case 'delete':
        let deleteQuery = this.supabase.from(table).delete();
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            deleteQuery = deleteQuery.eq(key, value);
          });
        }
        
        const deleteResult = await deleteQuery;
        result = deleteResult.data;
        error = deleteResult.error;
        break;

      case 'upsert':
        if (!data) throw new Error('Data is required for upsert operation');
        const upsertResult = await this.supabase.from(table).upsert(data);
        result = upsertResult.data;
        error = upsertResult.error;
        break;
    }

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            operation,
            table,
            result,
            count: Array.isArray(result) ? result.length : (result ? 1 : 0)
          }, null, 2)
        }
      ],
      isError: false
    };
  }

  private async handleAuth(args: any): Promise<CallToolResult> {
    const params = AuthOperationSchema.parse(args);
    const { operation, email, password, user_data } = params;

    let result: any;

    switch (operation) {
      case 'sign_up':
        if (!email || !password) throw new Error('Email and password required for sign up');
        result = await this.supabase.auth.signUp({
          email,
          password,
          options: { data: user_data }
        });
        break;

      case 'sign_in':
        if (!email || !password) throw new Error('Email and password required for sign in');
        result = await this.supabase.auth.signInWithPassword({ email, password });
        break;

      case 'sign_out':
        result = await this.supabase.auth.signOut();
        break;

      case 'get_user':
        result = await this.supabase.auth.getUser();
        break;

      case 'update_user':
        if (!user_data) throw new Error('User data required for update');
        result = await this.supabase.auth.updateUser(user_data);
        break;
    }

    if (result.error) {
      throw new Error(`Auth operation failed: ${result.error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            operation,
            success: true,
            data: result.data
          }, null, 2)
        }
      ],
      isError: false
    };
  }

  private async handleEdgeFunction(args: any) {
    const params = EdgeFunctionSchema.parse(args);
    const { function_name, payload, headers } = params;

    const { data, error } = await this.supabase.functions.invoke(function_name, {
      body: payload,
      headers: headers || {}
    });

    if (error) {
      throw new Error(`Edge Function failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            function_name,
            success: true,
            result: data
          }, null, 2)
        }
      ]
    };
  }

  private async handleRealtimeListener(args: any) {
    const params = RealtimeSchema.parse(args);
    const { table, event, filter, duration } = params;

    return new Promise((resolve) => {
      const events: any[] = [];
      
      let channel = this.supabase
        .channel(`realtime-${table}`)
        .on('postgres_changes' as any, {
          event,
          schema: 'public',
          table,
          filter
        }, (payload: any) => {
          events.push({
            timestamp: new Date().toISOString(),
            event: payload.eventType,
            old: payload.old,
            new: payload.new
          });
        })
        .subscribe();

      setTimeout(() => {
        channel.unsubscribe();
        resolve({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                table,
                event,
                duration,
                events_captured: events.length,
                events
              }, null, 2)
            }
          ]
        });
      }, duration);
    });
  }

  private async handleStorage(args: any) {
    const params = StorageSchema.parse(args);
    const { bucket, operation, file_path, file_data, options } = params;

    let result: any;

    switch (operation) {
      case 'create_bucket':
        result = await this.supabase.storage.createBucket(bucket, options);
        break;

      case 'upload':
        if (!file_path || !file_data) throw new Error('File path and data required for upload');
        const buffer = Buffer.from(file_data, 'base64');
        result = await this.supabase.storage.from(bucket).upload(file_path, buffer, options);
        break;

      case 'download':
        if (!file_path) throw new Error('File path required for download');
        result = await this.supabase.storage.from(bucket).download(file_path);
        break;

      case 'delete':
        if (!file_path) throw new Error('File path required for delete');
        result = await this.supabase.storage.from(bucket).remove([file_path]);
        break;

      case 'list':
        result = await this.supabase.storage.from(bucket).list(file_path || '', options);
        break;
    }

    if (result.error) {
      throw new Error(`Storage operation failed: ${result.error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            bucket,
            operation,
            success: true,
            result: result.data
          }, null, 2)
        }
      ]
    };
  }

  private async handleAnalytics(args: any) {
    const { metric, table_name, time_range } = args;

    // This would typically query Supabase's analytics API or custom views
    // For now, we'll provide basic table information
    let result: any;

    switch (metric) {
      case 'table_sizes':
        // Query for table sizes using system catalogs
        const { data: tables } = await this.supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        result = { tables: tables?.map(t => t.table_name) || [] };
        break;

      case 'user_activity':
        // Basic user count from profiles table
        const { count } = await this.supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        result = { total_users: count };
        break;

      default:
        result = { message: `Analytics for ${metric} not yet implemented` };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            metric,
            table_name,
            time_range,
            result
          }, null, 2)
        }
      ]
    };
  }

  private async handleSchema(args: any) {
    const { operation, table_name, policy_definition } = args;

    let result: any;

    switch (operation) {
      case 'list_tables':
        const { data: tables } = await this.supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        result = tables?.map(t => t.table_name) || [];
        break;

      case 'describe_table':
        if (!table_name) throw new Error('Table name required');
        
        const { data: columns } = await this.supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', table_name)
          .eq('table_schema', 'public');
        
        result = { table_name, columns };
        break;

      case 'list_policies':
        // This would require querying pg_policies system view
        result = { message: 'Policy listing requires admin privileges' };
        break;

      default:
        result = { message: `Schema operation ${operation} not yet implemented` };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            operation,
            table_name,
            result
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Supabase MCP Server running on stdio');
  }
}

// Start the server
const server = new SupabaseMCPServer();
server.run().catch(console.error);
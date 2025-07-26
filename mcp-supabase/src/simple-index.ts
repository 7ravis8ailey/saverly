#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

class SimpleSupabaseMCP {
  private server: Server;
  private supabase: any;

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

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'supabase_query',
            description: 'Execute Supabase database queries (SELECT, INSERT, UPDATE, DELETE)',
            inputSchema: {
              type: 'object',
              properties: {
                table: { type: 'string', description: 'Table name' },
                operation: { 
                  type: 'string', 
                  enum: ['select', 'insert', 'update', 'delete'],
                  description: 'Database operation type'
                },
                data: { type: 'object', description: 'Data for insert/update operations' },
                filters: { type: 'object', description: 'Filters for query' },
                columns: { type: 'string', description: 'Columns to select' },
                limit: { type: 'number', description: 'Limit results' }
              },
              required: ['table', 'operation']
            }
          },
          {
            name: 'supabase_auth',
            description: 'Handle user authentication',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  enum: ['sign_up', 'sign_in', 'get_user'],
                  description: 'Auth operation'
                },
                email: { type: 'string' },
                password: { type: 'string' },
                user_data: { type: 'object' }
              },
              required: ['operation']
            }
          }
        ] as Tool[]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'supabase_query':
            return await this.handleQuery(args);
          case 'supabase_auth':
            return await this.handleAuth(args);
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
          ]
        };
      }
    });
  }

  private async handleQuery(args: any) {
    const { table, operation, data, filters, columns, limit } = args;

    let query = this.supabase.from(table);
    let result: any;

    switch (operation) {
      case 'select':
        query = query.select(columns || '*');
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        if (limit) query = query.limit(limit);
        result = await query;
        break;

      case 'insert':
        result = await query.insert(data);
        break;

      case 'update':
        query = query.update(data);
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        result = await query;
        break;

      case 'delete':
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        result = await query.delete();
        break;
    }

    if (result.error) {
      throw new Error(`Database error: ${result.error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            operation,
            table,
            data: result.data,
            count: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0)
          }, null, 2)
        }
      ]
    };
  }

  private async handleAuth(args: any) {
    const { operation, email, password, user_data } = args;
    let result: any;

    switch (operation) {
      case 'sign_up':
        result = await this.supabase.auth.signUp({
          email,
          password,
          options: { data: user_data }
        });
        break;
      case 'sign_in':
        result = await this.supabase.auth.signInWithPassword({ email, password });
        break;
      case 'get_user':
        result = await this.supabase.auth.getUser();
        break;
    }

    if (result.error) {
      throw new Error(`Auth error: ${result.error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            operation,
            success: true,
            user: result.data?.user || result.data
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Simple Supabase MCP Server running on stdio');
  }
}

const server = new SimpleSupabaseMCP();
server.run().catch(console.error);
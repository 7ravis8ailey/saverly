#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

class SuperpoweredSupabaseMCP {
  private server: Server;
  private supabase: any;
  private supabaseCliPath: string;

  constructor() {
    this.server = new Server(
      {
        name: 'supabase-admin-mcp-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Try to initialize Supabase client if credentials exist
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
      }
    } catch (error) {
      console.error('Supabase client initialization failed, but admin tools will still work');
    }

    this.supabaseCliPath = this.findSupabaseCli();
    this.setupToolHandlers();
  }

  private findSupabaseCli(): string {
    try {
      // Try to find Supabase CLI
      const cliPath = execSync('which supabase', { encoding: 'utf8' }).trim();
      return cliPath;
    } catch (error) {
      return 'supabase'; // Fallback to PATH
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // === PROJECT MANAGEMENT ===
          {
            name: 'supabase_project_create',
            description: 'Create new Supabase project with full configuration',
            inputSchema: {
              type: 'object',
              properties: {
                project_name: { type: 'string', description: 'Project name' },
                org_id: { type: 'string', description: 'Organization ID' },
                region: { type: 'string', description: 'AWS region (e.g., us-east-1)' },
                database_password: { type: 'string', description: 'Database password' },
                plan: { type: 'string', enum: ['free', 'pro', 'team'], description: 'Subscription plan' }
              },
              required: ['project_name', 'database_password']
            }
          },
          {
            name: 'supabase_project_list',
            description: 'List all Supabase projects',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'supabase_project_init',
            description: 'Initialize local Supabase project structure',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: { type: 'string', description: 'Path to initialize project' },
                project_ref: { type: 'string', description: 'Remote project reference ID' }
              },
              required: ['project_path']
            }
          },

          // === SCHEMA & MIGRATIONS ===
          {
            name: 'supabase_migration_create',
            description: 'Create new database migration',
            inputSchema: {
              type: 'object',
              properties: {
                migration_name: { type: 'string', description: 'Migration name' },
                sql_content: { type: 'string', description: 'SQL content for migration' },
                project_path: { type: 'string', description: 'Project path' }
              },
              required: ['migration_name', 'sql_content']
            }
          },
          {
            name: 'supabase_migration_apply',
            description: 'Apply migrations to database',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: { type: 'string', description: 'Project path' },
                target_migration: { type: 'string', description: 'Specific migration to apply' }
              },
              required: []
            }
          },
          {
            name: 'supabase_schema_dump',
            description: 'Export current database schema',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: { type: 'string', description: 'Project path' },
                output_file: { type: 'string', description: 'Output file path' }
              },
              required: []
            }
          },

          // === FUNCTIONS & EDGE FUNCTIONS ===
          {
            name: 'supabase_function_create',
            description: 'Create new Edge Function',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: { type: 'string', description: 'Function name' },
                function_code: { type: 'string', description: 'TypeScript/JavaScript code' },
                project_path: { type: 'string', description: 'Project path' }
              },
              required: ['function_name', 'function_code']
            }
          },
          {
            name: 'supabase_function_deploy',
            description: 'Deploy Edge Functions',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: { type: 'string', description: 'Specific function name (optional)' },
                project_path: { type: 'string', description: 'Project path' }
              },
              required: []
            }
          },

          // === ENVIRONMENT & SECRETS ===
          {
            name: 'supabase_secrets_set',
            description: 'Set environment secrets',
            inputSchema: {
              type: 'object',
              properties: {
                secrets: { type: 'object', description: 'Key-value pairs of secrets' },
                project_path: { type: 'string', description: 'Project path' }
              },
              required: ['secrets']
            }
          },
          {
            name: 'supabase_config_update',
            description: 'Update Supabase configuration',
            inputSchema: {
              type: 'object',
              properties: {
                config_updates: { type: 'object', description: 'Configuration updates' },
                project_path: { type: 'string', description: 'Project path' }
              },
              required: ['config_updates']
            }
          },

          // === LINKING & DEPLOYMENT ===
          {
            name: 'supabase_project_link',
            description: 'Link local project to remote Supabase project',
            inputSchema: {
              type: 'object',
              properties: {
                project_ref: { type: 'string', description: 'Remote project reference ID' },
                project_path: { type: 'string', description: 'Local project path' }
              },
              required: ['project_ref']
            }
          },
          {
            name: 'supabase_deploy_all',
            description: 'Deploy everything (migrations, functions, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: { type: 'string', description: 'Project path' },
                force: { type: 'boolean', description: 'Force deployment' }
              },
              required: []
            }
          },

          // === DATABASE OPERATIONS (Enhanced) ===
          {
            name: 'supabase_query',
            description: 'Execute database queries with full SQL support',
            inputSchema: {
              type: 'object',
              properties: {
                sql: { type: 'string', description: 'Raw SQL query' },
                table: { type: 'string', description: 'Table name (for simple operations)' },
                operation: { 
                  type: 'string', 
                  enum: ['select', 'insert', 'update', 'delete', 'raw_sql'],
                  description: 'Operation type'
                },
                data: { type: 'object', description: 'Data for operations' },
                filters: { type: 'object', description: 'Query filters' },
                columns: { type: 'string', description: 'Columns to select' },
                limit: { type: 'number', description: 'Result limit' }
              },
              required: []
            }
          },

          // === MONITORING & ANALYTICS ===
          {
            name: 'supabase_project_status',
            description: 'Get comprehensive project status and health',
            inputSchema: {
              type: 'object',
              properties: {
                project_ref: { type: 'string', description: 'Project reference' },
                include_metrics: { type: 'boolean', description: 'Include performance metrics' }
              },
              required: []
            }
          },
          {
            name: 'supabase_logs',
            description: 'Fetch project logs and debugging information',
            inputSchema: {
              type: 'object',
              properties: {
                log_type: { 
                  type: 'string', 
                  enum: ['api', 'db', 'functions', 'auth'],
                  description: 'Type of logs to fetch'
                },
                lines: { type: 'number', description: 'Number of log lines' },
                project_path: { type: 'string', description: 'Project path' }
              },
              required: []
            }
          }
        ] as Tool[]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Project Management
          case 'supabase_project_create':
            return await this.handleProjectCreate(args);
          case 'supabase_project_list':
            return await this.handleProjectList(args);
          case 'supabase_project_init':
            return await this.handleProjectInit(args);

          // Schema & Migrations
          case 'supabase_migration_create':
            return await this.handleMigrationCreate(args);
          case 'supabase_migration_apply':
            return await this.handleMigrationApply(args);
          case 'supabase_schema_dump':
            return await this.handleSchemaDump(args);

          // Functions
          case 'supabase_function_create':
            return await this.handleFunctionCreate(args);
          case 'supabase_function_deploy':
            return await this.handleFunctionDeploy(args);

          // Environment
          case 'supabase_secrets_set':
            return await this.handleSecretsSet(args);
          case 'supabase_config_update':
            return await this.handleConfigUpdate(args);

          // Linking & Deployment
          case 'supabase_project_link':
            return await this.handleProjectLink(args);
          case 'supabase_deploy_all':
            return await this.handleDeployAll(args);

          // Database
          case 'supabase_query':
            return await this.handleQuery(args);

          // Monitoring
          case 'supabase_project_status':
            return await this.handleProjectStatus(args);
          case 'supabase_logs':
            return await this.handleLogs(args);

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

  // === PROJECT MANAGEMENT HANDLERS ===
  
  private async handleProjectCreate(args: any) {
    const { project_name, org_id, region, database_password, plan } = args;

    try {
      const command = [
        this.supabaseCliPath,
        'projects',
        'create',
        project_name,
        '--org-id', org_id || 'default',
        '--db-password', database_password,
        '--region', region || 'us-east-1',
        '--plan', plan || 'free'
      ];

      const result = execSync(command.join(' '), { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              project_name,
              command_output: result,
              message: 'Project created successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Project creation failed: ${error.message}`);
    }
  }

  private async handleProjectList(args: any) {
    try {
      const result = execSync(`${this.supabaseCliPath} projects list --output json`, {
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              projects: JSON.parse(result || '[]')
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Failed to list projects: ${error.message}`);
    }
  }

  private async handleProjectInit(args: any) {
    const { project_path, project_ref } = args;
    const workingDir = project_path || process.cwd();

    try {
      // Create project directory if it doesn't exist
      if (!existsSync(workingDir)) {
        mkdirSync(workingDir, { recursive: true });
      }

      // Initialize Supabase project
      const initCommand = `cd "${workingDir}" && ${this.supabaseCliPath} init`;
      const initResult = execSync(initCommand, { encoding: 'utf8' });

      let linkResult = '';
      if (project_ref) {
        const linkCommand = `cd "${workingDir}" && ${this.supabaseCliPath} link --project-ref ${project_ref}`;
        linkResult = execSync(linkCommand, { encoding: 'utf8' });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              project_path: workingDir,
              init_output: initResult,
              link_output: linkResult,
              message: 'Project initialized successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Project initialization failed: ${error.message}`);
    }
  }

  // === MIGRATION HANDLERS ===

  private async handleMigrationCreate(args: any) {
    const { migration_name, sql_content, project_path } = args;
    const workingDir = project_path || process.cwd();

    try {
      // Create migration file
      const command = `cd "${workingDir}" && ${this.supabaseCliPath} migration new ${migration_name}`;
      const result = execSync(command, { encoding: 'utf8' });

      // Extract the migration file path from the output
      const migrationPath = result.match(/Created new migration at (.+\.sql)/)?.[1];
      
      if (migrationPath && sql_content) {
        const fullPath = join(workingDir, migrationPath);
        writeFileSync(fullPath, sql_content);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              migration_name,
              migration_path: migrationPath,
              command_output: result,
              message: 'Migration created successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Migration creation failed: ${error.message}`);
    }
  }

  private async handleMigrationApply(args: any) {
    const { project_path, target_migration } = args;
    const workingDir = project_path || process.cwd();

    try {
      let command = `cd "${workingDir}" && ${this.supabaseCliPath} db push`;
      if (target_migration) {
        command += ` --migration ${target_migration}`;
      }

      const result = execSync(command, { encoding: 'utf8' });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              command_output: result,
              message: 'Migrations applied successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Migration application failed: ${error.message}`);
    }
  }

  // === FUNCTION HANDLERS ===

  private async handleFunctionCreate(args: any) {
    const { function_name, function_code, project_path } = args;
    const workingDir = project_path || process.cwd();

    try {
      // Create function
      const command = `cd "${workingDir}" && ${this.supabaseCliPath} functions new ${function_name}`;
      const result = execSync(command, { encoding: 'utf8' });

      // Write function code
      const functionPath = join(workingDir, 'supabase', 'functions', function_name, 'index.ts');
      if (existsSync(dirname(functionPath))) {
        writeFileSync(functionPath, function_code);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              function_name,
              function_path: functionPath,
              command_output: result,
              message: 'Edge Function created successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Function creation failed: ${error.message}`);
    }
  }

  private async handleFunctionDeploy(args: any) {
    const { function_name, project_path } = args;
    const workingDir = project_path || process.cwd();

    try {
      let command = `cd "${workingDir}" && ${this.supabaseCliPath} functions deploy`;
      if (function_name) {
        command += ` ${function_name}`;
      }

      const result = execSync(command, { encoding: 'utf8' });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              function_name: function_name || 'all functions',
              command_output: result,
              message: 'Functions deployed successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Function deployment failed: ${error.message}`);
    }
  }

  // === ENVIRONMENT HANDLERS ===

  private async handleSecretsSet(args: any) {
    const { secrets, project_path } = args;
    const workingDir = project_path || process.cwd();

    try {
      const results = [];
      
      for (const [key, value] of Object.entries(secrets)) {
        const command = `cd "${workingDir}" && ${this.supabaseCliPath} secrets set ${key}="${value}"`;
        const result = execSync(command, { encoding: 'utf8' });
        results.push({ key, result });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              secrets_set: Object.keys(secrets),
              results,
              message: 'Secrets set successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Setting secrets failed: ${error.message}`);
    }
  }

  // === QUERY HANDLER (Enhanced) ===

  private async handleQuery(args: any) {
    const { sql, table, operation, data, filters, columns, limit } = args;

    // If raw SQL is provided, execute it directly
    if (sql || operation === 'raw_sql') {
      try {
        if (!this.supabase) {
          throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        }

        const { data: result, error } = await this.supabase.rpc('exec_sql', { query: sql });
        
        if (error) throw new Error(error.message);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                query: sql,
                result,
                message: 'Raw SQL executed successfully!'
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        throw new Error(`Raw SQL execution failed: ${error.message}`);
      }
    }

    // Standard operations (same as before)
    if (!table || !operation) {
      throw new Error('Table and operation are required for standard queries');
    }

    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

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

  // === UTILITY HANDLERS ===

  private async handleProjectStatus(args: any) {
    const { project_ref, include_metrics } = args;

    try {
      let command = `${this.supabaseCliPath} projects list --output json`;
      const projectsResult = execSync(command, { encoding: 'utf8' });
      const projects = JSON.parse(projectsResult || '[]');

      let specificProject = null;
      if (project_ref) {
        specificProject = projects.find((p: any) => p.id === project_ref);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              projects: project_ref ? [specificProject] : projects,
              include_metrics,
              message: 'Project status retrieved successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Failed to get project status: ${error.message}`);
    }
  }

  private async handleProjectLink(args: any) {
    const { project_ref, project_path } = args;
    const workingDir = project_path || process.cwd();

    try {
      const command = `cd "${workingDir}" && ${this.supabaseCliPath} link --project-ref ${project_ref}`;
      const result = execSync(command, { encoding: 'utf8' });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              project_ref,
              project_path: workingDir,
              command_output: result,
              message: 'Project linked successfully!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Project linking failed: ${error.message}`);
    }
  }

  private async handleDeployAll(args: any) {
    const { project_path, force } = args;
    const workingDir = project_path || process.cwd();

    try {
      const commands = [
        `cd "${workingDir}" && ${this.supabaseCliPath} db push`,
        `cd "${workingDir}" && ${this.supabaseCliPath} functions deploy`
      ];

      const results = [];
      for (const command of commands) {
        try {
          const result = execSync(command, { encoding: 'utf8' });
          results.push({ command, result, success: true });
        } catch (error: any) {
          results.push({ command, error: error.message, success: false });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              deployment_results: results,
              message: 'Deployment completed!'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  private async handleSchemaDump(args: any) {
    throw new Error('Schema dump not implemented yet');
  }

  private async handleConfigUpdate(args: any) {
    throw new Error('Config update not implemented yet');
  }

  private async handleLogs(args: any) {
    throw new Error('Logs not implemented yet');
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Superpowered Supabase MCP Server running with full admin control!');
  }
}

const server = new SuperpoweredSupabaseMCP();
server.run().catch(console.error);
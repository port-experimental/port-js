/**
 * Main Port SDK client
 * 
 * ⚠️ **BACKEND/SERVER-SIDE USE ONLY**
 * 
 * This SDK is designed for backend/server-side environments only.
 * DO NOT use in browser/frontend applications where credentials would be exposed.
 * 
 * @see {@link https://github.com/port-experimental/port-js#backend-server-side-only|Security Notice}
 */

import { HttpClient } from './http-client';
import { PortClientConfig, resolveConfig } from './config';
import { PortAuthError } from './errors';
import { EntityResource } from './resources/entities';
import { BlueprintResource } from './resources/blueprints';
import { ActionResource } from './resources/actions';
import { ActionRunResource } from './resources/action-runs';
import { ScorecardResource } from './resources/scorecards';
import { TeamResource } from './resources/teams';
import { UserResource } from './resources/users';
import { AuditResource } from './resources/audit';
import { WebhookResource } from './resources/webhooks';
import { IntegrationResource } from './resources/integrations';
import { OrganizationResource } from './resources/organization';
import { AppResource } from './resources/apps';
import { MigrationResource } from './resources/migrations';
import { AuthResource } from './resources/auth';

/**
 * Check if the code is running in a browser environment
 * 
 * @internal
 */
function isBrowserEnvironment(): boolean {
  // Check for window object (browser environment)
  // Use typeof check to avoid TypeScript errors when DOM types are not available
  if (typeof (globalThis as { window?: unknown }).window !== 'undefined') {
    return true;
  }
  
  // Check for document object (browser environment)
  if (typeof (globalThis as { document?: unknown }).document !== 'undefined') {
    return true;
  }
  
  return false;
}

/**
 * Port SDK Client
 * 
 * ⚠️ **IMPORTANT:** This SDK is for backend/server-side use only.
 * Never use in browser/frontend applications where credentials would be publicly exposed.
 * 
 * @example
 * Create client with OAuth credentials (Backend only!)
 * ```typescript
 * // ✅ GOOD - In Node.js backend (Express, NestJS, etc.)
 * const client = new PortClient({
 *   credentials: {
 *     clientId: process.env.PORT_CLIENT_ID!,
 *     clientSecret: process.env.PORT_CLIENT_SECRET!,
 *   },
 * });
 * ```
 * 
 * @example
 * ❌ BAD - Never do this in browser/React/Vue/Angular
 * ```typescript
 * // ❌ NEVER DO THIS - Credentials exposed to users!
 * const client = new PortClient({
 *   credentials: {
 *     clientId: 'your-client-id',  // ❌ Exposed in browser!
 *     clientSecret: 'your-client-secret',  // ❌ Major security risk!
 *   },
 * });
 * ```
 * 
 * @example
 * Create client with access token
 * ```typescript
 * const client = new PortClient({
 *   credentials: {
 *     accessToken: 'your-jwt-token',
 *   },
 * });
 * ```
 * 
 * @example
 * Create client for US region
 * ```typescript
 * const client = new PortClient({
 *   region: 'us',
 *   credentials: {
 *     clientId: process.env.PORT_CLIENT_ID!,
 *     clientSecret: process.env.PORT_CLIENT_SECRET!,
 *   },
 * });
 * ```
 * 
 * @example
 * Create client from environment variables
 * ```typescript
 * // Requires PORT_CLIENT_ID and PORT_CLIENT_SECRET in env or .env file
 * const client = new PortClient();
 * ```
 */
export class PortClient {
  private readonly httpClient: HttpClient;
  private _entities?: EntityResource;
  private _blueprints?: BlueprintResource;
  private _actions?: ActionResource;
  private _actionRuns?: ActionRunResource;
  private _scorecards?: ScorecardResource;
  private _teams?: TeamResource;
  private _users?: UserResource;
  private _audit?: AuditResource;
  private _webhooks?: WebhookResource;
  private _integrations?: IntegrationResource;
  private _organization?: OrganizationResource;
  private _apps?: AppResource;
  private _migrations?: MigrationResource;
  private _auth?: AuthResource;

  /**
   * Create a new Port SDK client
   * 
   * @param config - Client configuration options
   * 
   * Configuration precedence:
   * 1. Explicit config object
   * 2. Environment variables (PORT_CLIENT_ID, PORT_CLIENT_SECRET, etc.)
   * 3. .env file
   * 4. Defaults (EU region, 30s timeout, 3 retries)
   * 
   * @throws {PortAuthError} If no credentials are provided
   * @throws {PortAuthError} If running in browser environment
   */
  constructor(config?: PortClientConfig) {
    // Block browser usage to prevent credential leaks
    if (isBrowserEnvironment()) {
      throw new PortAuthError(
        'Port SDK cannot be used in browser environments. ' +
        'This SDK is designed for backend/server-side use only to prevent credential exposure. ' +
        'Please use this SDK only in Node.js environments (Express, NestJS, etc.).'
      );
    }

    // Validate configuration early before creating HTTP client
    this.validateConfig(config);

    // Resolve configuration from all sources
    const resolvedConfig = resolveConfig(config);

    // Create HTTP client
    this.httpClient = new HttpClient(resolvedConfig);
  }

  /**
   * Validate configuration early before creating HTTP client
   * 
   * @internal
   */
  private validateConfig(config?: PortClientConfig): void {
    // Check if credentials are provided in config
    const hasConfigCredentials = !!(
      (config?.credentials && 'clientId' in config.credentials && 'clientSecret' in config.credentials) ||
      (config?.credentials && 'accessToken' in config.credentials)
    );

    // Check if credentials might be available from environment
    const hasEnvCredentials = !!(
      process.env.PORT_CLIENT_ID && process.env.PORT_CLIENT_SECRET
    ) || !!process.env.PORT_ACCESS_TOKEN;

    // If no credentials in config and might not be in env, throw early
    // Note: We can't fully validate env credentials here without calling resolveConfig,
    // but we can at least validate the config object itself
    if (!hasConfigCredentials && !hasEnvCredentials) {
      throw new PortAuthError(
        'No credentials provided. Please provide credentials via:\n' +
        '1. Config object: { credentials: { clientId, clientSecret } } or { credentials: { accessToken } }\n' +
        '2. Environment variables: PORT_CLIENT_ID + PORT_CLIENT_SECRET or PORT_ACCESS_TOKEN\n' +
        '3. .env file with PORT_CLIENT_ID + PORT_CLIENT_SECRET or PORT_ACCESS_TOKEN'
      );
    }
  }

  // Lazy-loaded resources
  public get entities(): EntityResource {
    if (!this._entities) {
      this._entities = new EntityResource(this.httpClient);
    }
    return this._entities;
  }

  public get blueprints(): BlueprintResource {
    if (!this._blueprints) {
      this._blueprints = new BlueprintResource(this.httpClient);
    }
    return this._blueprints;
  }

  public get actions(): ActionResource {
    if (!this._actions) {
      this._actions = new ActionResource(this.httpClient);
    }
    return this._actions;
  }

  public get actionRuns(): ActionRunResource {
    if (!this._actionRuns) {
      this._actionRuns = new ActionRunResource(this.httpClient);
    }
    return this._actionRuns;
  }

  public get scorecards(): ScorecardResource {
    if (!this._scorecards) {
      this._scorecards = new ScorecardResource(this.httpClient);
    }
    return this._scorecards;
  }

  public get teams(): TeamResource {
    if (!this._teams) {
      this._teams = new TeamResource(this.httpClient);
    }
    return this._teams;
  }

  public get users(): UserResource {
    if (!this._users) {
      this._users = new UserResource(this.httpClient);
    }
    return this._users;
  }

  public get audit(): AuditResource {
    if (!this._audit) {
      this._audit = new AuditResource(this.httpClient);
    }
    return this._audit;
  }

  public get webhooks(): WebhookResource {
    if (!this._webhooks) {
      this._webhooks = new WebhookResource(this.httpClient);
    }
    return this._webhooks;
  }

  public get integrations(): IntegrationResource {
    if (!this._integrations) {
      this._integrations = new IntegrationResource(this.httpClient);
    }
    return this._integrations;
  }

  public get organization(): OrganizationResource {
    if (!this._organization) {
      this._organization = new OrganizationResource(this.httpClient);
    }
    return this._organization;
  }

  public get apps(): AppResource {
    if (!this._apps) {
      this._apps = new AppResource(this.httpClient);
    }
    return this._apps;
  }

  public get migrations(): MigrationResource {
    if (!this._migrations) {
      this._migrations = new MigrationResource(this.httpClient);
    }
    return this._migrations;
  }

  public get auth(): AuthResource {
    if (!this._auth) {
      this._auth = new AuthResource(this.httpClient);
    }
    return this._auth;
  }

  /**
   * Get the underlying HTTP client
   * Advanced use only - for custom requests not covered by resource methods
   */
  public getHttpClient(): HttpClient {
    return this.httpClient;
  }
}


/**
 * Main Port SDK client
 * 
 * ⚠️ **BACKEND/SERVER-SIDE USE ONLY**
 * 
 * This SDK is designed for backend/server-side environments only.
 * DO NOT use in browser/frontend applications where credentials would be exposed.
 * 
 * @see {@link https://github.com/port-labs/port-js#backend-server-side-only|Security Notice}
 */

import { HttpClient } from './http-client';
import { PortClientConfig, resolveConfig } from './config';
import { EntityResource } from './resources/entities';
import { BlueprintResource } from './resources/blueprints';
import { ActionResource } from './resources/actions';
import { ActionRunResource } from './resources/action-runs';
import { ScorecardResource } from './resources/scorecards';
import { TeamResource } from './resources/teams';
import { UserResource } from './resources/users';
import { AuditResource } from './resources/audit';
import { WebhookResource } from './resources/webhooks';

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

  // Resources
  public readonly entities: EntityResource;
  public readonly blueprints: BlueprintResource;
  public readonly actions: ActionResource;
  public readonly actionRuns: ActionRunResource;
  public readonly scorecards: ScorecardResource;
  public readonly teams: TeamResource;
  public readonly users: UserResource;
  public readonly audit: AuditResource;
  public readonly webhooks: WebhookResource;

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
   */
  constructor(config?: PortClientConfig) {
    // Resolve configuration from all sources
    const resolvedConfig = resolveConfig(config);

    // Create HTTP client
    this.httpClient = new HttpClient(resolvedConfig);

    // Initialize resources
    this.entities = new EntityResource(this.httpClient);
    this.blueprints = new BlueprintResource(this.httpClient);
    this.actions = new ActionResource(this.httpClient);
    this.actionRuns = new ActionRunResource(this.httpClient);
    this.scorecards = new ScorecardResource(this.httpClient);
    this.teams = new TeamResource(this.httpClient);
    this.users = new UserResource(this.httpClient);
    this.audit = new AuditResource(this.httpClient);
    this.webhooks = new WebhookResource(this.httpClient);
  }

  /**
   * Get the underlying HTTP client
   * Advanced use only - for custom requests not covered by resource methods
   */
  public getHttpClient(): HttpClient {
    return this.httpClient;
  }
}


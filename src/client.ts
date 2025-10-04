/**
 * Main Port SDK client
 */

import { HttpClient } from './http-client';
import { PortClientConfig, resolveConfig } from './config';
import { EntityResource } from './resources/entities';
import { BlueprintResource } from './resources/blueprints';
import { ActionResource } from './resources/actions';
import { ScorecardResource } from './resources/scorecards';

/**
 * Port SDK Client
 * 
 * @example
 * Create client with OAuth credentials
 * ```typescript
 * const client = new PortClient({
 *   credentials: {
 *     clientId: 'your-client-id',
 *     clientSecret: 'your-client-secret',
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
  public readonly scorecards: ScorecardResource;

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
    this.scorecards = new ScorecardResource(this.httpClient);
  }

  /**
   * Get the underlying HTTP client
   * Advanced use only - for custom requests not covered by resource methods
   */
  public getHttpClient(): HttpClient {
    return this.httpClient;
  }
}


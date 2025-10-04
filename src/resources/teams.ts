import type { HttpClient, RequestOptions } from '../http-client';
import { BaseResource } from './base';
import type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
  ChangeTeamInput,
  ListTeamsOptions,
} from '../types/teams';
import { PortValidationError } from '../errors';

/**
 * API response wrappers
 */
interface ApiTeamResponse {
  team: {
    id: string;
    name: string;
    description?: string;
    provider?: string;
    createdAt: string;
    updatedAt: string;
    users?: Array<{
      email: string;
      firstName?: string;
      lastName?: string;
      picture?: string;
      status?: string;
    }>;
    [key: string]: unknown; // Support custom properties
  };
  ok: boolean;
}

interface ApiTeamsResponse {
  teams: Array<{
    id: string;
    name: string;
    description?: string;
    provider?: string;
    createdAt: string;
    updatedAt: string;
    users?: Array<{
      email: string;
      firstName?: string;
      lastName?: string;
      picture?: string;
      status?: string;
    }>;
    [key: string]: unknown; // Support custom properties
  }>;
  ok: boolean;
}

/**
 * TeamResource handles team-related operations
 */
export class TeamResource extends BaseResource {
  private readonly basePath = '/v1/teams';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  /**
   * Create a new team
   * 
   * @param data - Team data
   * @param options - Request options (timeout, headers, signal)
   * 
   * @throws {PortValidationError} If team name is invalid
   * 
   * @example
   * ```typescript
   * const team = await client.teams.create({
   *   name: 'platform-team',
   *   description: 'Platform Engineering Team',
   *   users: ['alice@company.com', 'bob@company.com']
   * });
   * console.log(`Created team: ${team.name}`);
   * ```
   */
  async create(data: CreateTeamInput, options?: RequestOptions): Promise<Team> {
    this.validateCreateInput(data);

    // Pass all properties including custom ones
    const response = await this.httpClient.post<ApiTeamResponse>(
      this.basePath,
      data, // Send entire data object to support custom properties
      options
    );

    return this.transformTeam(response.team);
  }

  /**
   * Get a team by name
   * 
   * @param name - Team name
   * @param options - Request options (timeout, headers, signal)
   * 
   * @throws {PortNotFoundError} If team doesn't exist
   * 
   * @example
   * ```typescript
   * const team = await client.teams.get('platform-team');
   * console.log(`Team: ${team.name} (${team.users?.length || 0} users)`);
   * ```
   */
  async get(name: string, options?: RequestOptions): Promise<Team> {
    this.validateIdentifier(name, 'name');

    const response = await this.httpClient.get<ApiTeamResponse>(
      `${this.basePath}/${encodeURIComponent(name)}`,
      options
    );

    return this.transformTeam(response.team);
  }

  /**
   * Update a team (partial update)
   * 
   * @param name - Team name
   * @param data - Fields to update
   * @param options - Request options (timeout, headers, signal)
   * 
   * @throws {PortNotFoundError} If team doesn't exist
   * 
   * @example
   * ```typescript
   * const updated = await client.teams.update('platform-team', {
   *   description: 'Updated description',
   *   users: ['alice@company.com', 'bob@company.com', 'charlie@company.com']
   * });
   * console.log(`Updated team: ${updated.name}`);
   * ```
   */
  async update(
    name: string,
    data: UpdateTeamInput,
    options?: RequestOptions
  ): Promise<Team> {
    this.validateIdentifier(name, 'name');

    const response = await this.httpClient.patch<ApiTeamResponse>(
      `${this.basePath}/${encodeURIComponent(name)}`,
      data,
      options
    );

    return this.transformTeam(response.team);
  }

  /**
   * Change a team (full replacement)
   * 
   * @param name - Team name
   * @param data - Complete team data
   * @param options - Request options (timeout, headers, signal)
   * 
   * @throws {PortNotFoundError} If team doesn't exist
   * 
   * @example
   * ```typescript
   * const replaced = await client.teams.change('platform-team', {
   *   description: 'New description',
   *   users: ['new-user@company.com'] // Replaces all existing users
   * });
   * ```
   */
  async change(
    name: string,
    data: ChangeTeamInput,
    options?: RequestOptions
  ): Promise<Team> {
    this.validateIdentifier(name, 'name');

    const response = await this.httpClient.put<ApiTeamResponse>(
      `${this.basePath}/${encodeURIComponent(name)}`,
      data,
      options
    );

    return this.transformTeam(response.team);
  }

  /**
   * Delete a team
   * 
   * @param name - Team name
   * @param options - Request options (timeout, headers, signal)
   * 
   * @throws {PortNotFoundError} If team doesn't exist
   * 
   * @example
   * ```typescript
   * await client.teams.delete('old-team');
   * console.log('Team deleted successfully');
   * ```
   */
  async delete(name: string, options?: RequestOptions): Promise<void> {
    this.validateIdentifier(name, 'name');

    await this.httpClient.delete(
      `${this.basePath}/${encodeURIComponent(name)}`,
      options
    );
  }

  /**
   * List all teams
   * 
   * @param options - List options (fields to include)
   * 
   * @example
   * ```typescript
   * // Get all teams with basic info
   * const teams = await client.teams.list();
   * 
   * // Get teams with user information
   * const teamsWithUsers = await client.teams.list({
   *   fields: ['name', 'description', 'users.email', 'users.firstName']
   * });
   * ```
   */
  async list(
    options?: ListTeamsOptions & { requestOptions?: RequestOptions }
  ): Promise<Team[]> {
    let url = this.basePath;

    // Add fields query parameter if specified
    if (options?.fields && options.fields.length > 0) {
      const params = new URLSearchParams();
      options.fields.forEach((field) => params.append('fields', field));
      url = `${url}?${params.toString()}`;
    }

    const response = await this.httpClient.get<ApiTeamsResponse>(
      url,
      options?.requestOptions
    );

    return (response.teams || []).map((team) => this.transformTeam(team));
  }

  /**
   * Transform API team to SDK team
   */
  private transformTeam(apiTeam: ApiTeamResponse['team']): Team {
    // Extract known fields
    const { id, name, description, provider, createdAt, updatedAt, users, ...customProps } = apiTeam;
    
    return {
      id,
      name,
      description,
      provider,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      users: users?.map((user) => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        status: user.status,
      })),
      // Preserve all custom properties
      ...customProps,
    };
  }

  /**
   * Validate identifier
   */
  private validateIdentifier(identifier: string, fieldName: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError(`${fieldName} is required`, [
        { field: fieldName, message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate create input
   */
  private validateCreateInput(data: CreateTeamInput): void {
    if (!data.name || data.name.trim() === '') {
      throw new PortValidationError('Team name is required', [
        { field: 'name', message: 'Required field' },
      ]);
    }
  }
}


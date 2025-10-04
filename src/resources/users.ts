/**
 * User resource operations
 */

import { BaseResource } from './base';
import type { HttpClient, RequestOptions } from '../http-client';
import type {
  User,
  InviteUserInput,
  UpdateUserInput,
  ListUsersOptions,
  GetUserOptions,
} from '../types/users';
import { PortValidationError } from '../errors';

/**
 * API response wrappers
 */
interface ApiUserResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    status?: string;
    type?: string;
    providers?: string[];
    createdAt: string;
    updatedAt: string;
    roles?: Array<{
      name: string;
    }>;
    teams?: Array<{
      name: string;
    }>;
  };
  ok: boolean;
}

interface ApiUsersResponse {
  users: Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    status?: string;
    type?: string;
    providers?: string[];
    createdAt: string;
    updatedAt: string;
    roles?: Array<{
      name: string;
    }>;
    teams?: Array<{
      name: string;
    }>;
  }>;
  ok: boolean;
}

/**
 * UserResource handles user-related operations
 */
export class UserResource extends BaseResource {
  private readonly basePath = '/v1/users';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  /**
   * Invite a new user
   * 
   * @param data - User invite data
   * @param options - Request options
   * @returns The invited user
   * 
   * @example
   * ```typescript
   * const user = await client.users.invite({
   *   email: 'alice@company.com',
   *   roles: ['Admin'],
   *   teams: ['platform-team']
   * });
   * console.log(`Invited user: ${user.email}`);
   * ```
   */
  async invite(data: InviteUserInput, options?: RequestOptions): Promise<User> {
    this.validateInviteInput(data);

    const response = await this.httpClient.post<ApiUserResponse>(
      `${this.basePath}/invite`,
      { invitee: data },
      options
    );

    return this.transformUser(response.user);
  }

  /**
   * Get a user by email
   * 
   * @param email - User email address
   * @param options - Get options
   * @param requestOptions - Request options
   * @returns The user
   * 
   * @example
   * ```typescript
   * const user = await client.users.get('alice@company.com', {
   *   fields: ['roles', 'teams']
   * });
   * console.log(`User: ${user.email}, Status: ${user.status}`);
   * ```
   */
  async get(
    email: string,
    options?: GetUserOptions,
    requestOptions?: RequestOptions
  ): Promise<User> {
    this.validateEmail(email);

    const url = this.buildUrl(`${this.basePath}/${encodeURIComponent(email)}`, {
      fields: options?.fields?.join(','),
    });

    const response = await this.httpClient.get<ApiUserResponse>(url, requestOptions);
    return this.transformUser(response.user);
  }

  /**
   * Update a user's roles and teams
   * 
   * @param email - User email address
   * @param data - Update data
   * @param options - Request options
   * @returns The updated user
   * 
   * @example
   * ```typescript
   * const user = await client.users.update('alice@company.com', {
   *   roles: ['Admin', 'Developer'],
   *   teams: ['platform-team', 'security-team']
   * });
   * console.log(`Updated roles: ${user.roles?.map(r => r.name).join(', ')}`);
   * ```
   */
  async update(
    email: string,
    data: UpdateUserInput,
    options?: RequestOptions
  ): Promise<User> {
    this.validateEmail(email);

    const response = await this.httpClient.patch<ApiUserResponse>(
      `${this.basePath}/${encodeURIComponent(email)}`,
      data,
      options
    );

    return this.transformUser(response.user);
  }

  /**
   * Delete a user
   * 
   * @param email - User email address
   * @param options - Request options
   * 
   * @example
   * ```typescript
   * await client.users.delete('alice@company.com');
   * console.log('User deleted');
   * ```
   */
  async delete(email: string, options?: RequestOptions): Promise<void> {
    this.validateEmail(email);

    await this.httpClient.delete(
      `${this.basePath}/${encodeURIComponent(email)}`,
      options
    );
  }

  /**
   * List all users in the organization
   * 
   * @param options - List options
   * @param requestOptions - Request options
   * @returns Array of users
   * 
   * @example
   * ```typescript
   * const users = await client.users.list({
   *   fields: ['roles', 'teams']
   * });
   * console.log(`Found ${users.length} users`);
   * users.forEach(user => {
   *   console.log(`- ${user.email}: ${user.status}`);
   * });
   * ```
   */
  async list(
    options?: ListUsersOptions,
    requestOptions?: RequestOptions
  ): Promise<User[]> {
    const url = this.buildUrl(this.basePath, {
      fields: options?.fields?.join(','),
    });

    const response = await this.httpClient.get<ApiUsersResponse>(
      url,
      requestOptions
    );

    return (response.users || []).map((user) => this.transformUser(user));
  }

  /**
   * Transform API user to SDK user
   */
  private transformUser(apiUser: ApiUserResponse['user']): User {
    return {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      picture: apiUser.picture,
      status: apiUser.status,
      type: apiUser.type,
      providers: apiUser.providers,
      createdAt: new Date(apiUser.createdAt),
      updatedAt: new Date(apiUser.updatedAt),
      roles: apiUser.roles,
      teams: apiUser.teams,
    };
  }

  /**
   * Validate email
   */
  private validateEmail(email: string): void {
    if (!email || email.trim() === '') {
      throw new PortValidationError('Email is required', [
        { field: 'email', message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate invite input
   */
  private validateInviteInput(data: InviteUserInput): void {
    if (!data.email || data.email.trim() === '') {
      throw new PortValidationError('Email is required', [
        { field: 'email', message: 'Required field' },
      ]);
    }
  }
}


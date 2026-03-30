/**
 * Authentication resource operations
 * 
 * Provides methods for managing Port.io API authentication:
 * - Create access tokens from client credentials
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type { CreateAccessTokenInput, AccessToken } from '../types/auth';
import type { ApiAccessTokenResponse } from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * Authentication resource class
 * 
 * @example
 * ```typescript
 * const client = new PortClient({...});
 * 
 * // Create an access token
 * const token = await client.auth.createAccessToken({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 * });
 * 
 * console.log(`Access token: ${token.accessToken}`);
 * console.log(`Expires in: ${token.expiresIn} seconds`);
 * ```
 */
export class AuthResource extends BaseResource {
  private readonly basePath = '/v1/auth';

  /**
   * Create an access token from client credentials
   * 
   * @param data - Client credentials (clientId and clientSecret)
   * @param options - Optional request options (timeout, headers, signal)
   * @returns Access token with expiration information
   * 
   * @throws {PortValidationError} If credentials are invalid
   * @throws {PortAuthError} If authentication fails
   * 
   * @example
   * ```typescript
   * const token = await client.auth.createAccessToken({
   *   clientId: process.env.PORT_CLIENT_ID!,
   *   clientSecret: process.env.PORT_CLIENT_SECRET!,
   * });
 * 
 * // Use the token for API requests
 * const customClient = new PortClient({
 *   credentials: { accessToken: token.accessToken },
 * });
 * ```
   */
  async createAccessToken(
    data: CreateAccessTokenInput,
    options?: RequestOptions
  ): Promise<AccessToken> {
    this.validateCreateInput(data);

    const response = await this.httpClient.post<ApiAccessTokenResponse>(
      `${this.basePath}/access_token`,
      data,
      options
    );

    return {
      accessToken: response.accessToken,
      expiresIn: response.expiresIn,
      tokenType: response.tokenType,
      ok: response.ok,
    };
  }

  /**
   * Validate create access token input
   */
  private validateCreateInput(data: CreateAccessTokenInput): void {
    if (!data.clientId || data.clientId.trim() === '') {
      throw new PortValidationError('Client ID is required', [
        { field: 'clientId', message: 'Required field' },
      ]);
    }

    if (!data.clientSecret || data.clientSecret.trim() === '') {
      throw new PortValidationError('Client secret is required', [
        { field: 'clientSecret', message: 'Required field' },
      ]);
    }
  }
}


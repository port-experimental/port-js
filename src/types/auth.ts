/**
 * Authentication related types
 * 
 * Types for managing Port.io API authentication tokens
 */

/**
 * Create access token input
 */
export interface CreateAccessTokenInput {
  /** Your Port client ID */
  clientId: string;
  /** Your Port client secret */
  clientSecret: string;
}

/**
 * Access token response
 */
export interface AccessToken {
  /** The access token */
  accessToken: string;
  /** The number of seconds until the access token expires */
  expiresIn: number;
  /** Token type (typically "Bearer") */
  tokenType: string;
  /** Success indicator */
  ok?: boolean;
}


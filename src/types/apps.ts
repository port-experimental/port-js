/**
 * App (Credentials) related types
 * 
 * Types for managing Port.io app installations and credentials
 */

/**
 * App entity (represents a set of credentials)
 */
export interface App {
  /** The unique identifier of the app/credentials set */
  id: string;
  /** The name of the app/credentials set */
  name?: string;
  /** Whether the app is enabled */
  enabled?: boolean;
  /** The secret/credential value (only returned when explicitly requested) */
  secret?: string;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Input for updating an app name
 */
export interface UpdateAppInput {
  /** The new name of the credentials set */
  name: string;
}

/**
 * App secret rotation result
 */
export interface AppSecret {
  /** The app ID */
  id?: string;
  /** The app name */
  name?: string;
  /** Whether the app is enabled */
  enabled?: boolean;
  /** The new secret value (only returned immediately after rotation) */
  secret?: string;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Options for listing apps
 */
export interface ListAppsOptions {
  /** The fields to include in the response */
  fields?: ('id' | 'name' | 'createdAt' | 'updatedAt' | 'secret' | 'enabled')[];
}


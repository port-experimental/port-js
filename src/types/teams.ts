/**
 * Team-related types
 */

/**
 * Team entity
 */
export interface Team {
  /** Unique identifier for the team */
  id: string;
  /** Team name */
  name: string;
  /** Team description */
  description?: string;
  /** Provider (e.g., 'port', 'okta', 'auth0') */
  provider?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Team users (if included via fields parameter) */
  users?: TeamUser[];
  /** Custom properties (any additional fields) */
  [key: string]: unknown;
}

/**
 * Team user
 */
export interface TeamUser {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  status?: string;
}

/**
 * Input for creating a team
 */
export interface CreateTeamInput {
  /** Team name (used as identifier) */
  name: string;
  /** Team description */
  description?: string;
  /** User emails to add to the team */
  users?: string[];
  /** Custom properties (any additional fields) */
  [key: string]: unknown;
}

/**
 * Input for updating a team (PATCH - partial update)
 */
export interface UpdateTeamInput {
  /** Team description */
  description?: string;
  /** User emails to add to the team */
  users?: string[];
  /** Custom properties (any additional fields) */
  [key: string]: unknown;
}

/**
 * Input for changing a team (PUT - full replacement)
 */
export interface ChangeTeamInput {
  /** Team description */
  description?: string;
  /** User emails (replaces entire user list) */
  users?: string[];
  /** Custom properties (any additional fields) */
  [key: string]: unknown;
}

/**
 * Options for listing teams
 */
export interface ListTeamsOptions {
  /** Fields to include in the response */
  fields?: Array<
    | 'id'
    | 'name'
    | 'createdAt'
    | 'updatedAt'
    | 'provider'
    | 'description'
    | 'users.firstName'
    | 'users.lastName'
    | 'users.email'
    | 'users.picture'
    | 'users.status'
  >;
}


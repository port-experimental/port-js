/**
 * User-related types
 */

/**
 * User entity
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User email address */
  email: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Profile picture URL */
  picture?: string;
  /** User status (e.g., 'VERIFIED', 'PENDING') */
  status?: string;
  /** User type (e.g., 'user', 'admin') */
  type?: string;
  /** Authentication providers */
  providers?: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** User roles */
  roles?: Array<{
    name: string;
  }>;
  /** User teams */
  teams?: Array<{
    name: string;
  }>;
}

/**
 * Input for inviting a user
 */
export interface InviteUserInput {
  /** User email address */
  email: string;
  /** Roles to assign to the user */
  roles?: string[];
  /** Teams to assign the user to */
  teams?: string[];
}

/**
 * Input for updating a user
 */
export interface UpdateUserInput {
  /** Roles to assign to the user (replaces existing) */
  roles?: string[];
  /** Teams to assign the user to (replaces existing) */
  teams?: string[];
}

/**
 * Options for listing users
 */
export interface ListUsersOptions {
  /** Include specific fields (e.g., 'roles', 'teams') */
  fields?: string[];
}

/**
 * Options for getting a user
 */
export interface GetUserOptions {
  /** Include specific fields (e.g., 'roles', 'teams') */
  fields?: string[];
}


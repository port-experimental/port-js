/**
 * Migration related types
 * 
 * Types for managing bulk data transformations in Port.io
 */

/**
 * Migration status
 */
export type MigrationStatus =
  | 'COMPLETED'
  | 'RUNNING'
  | 'PENDING'
  | 'INITIALIZING'
  | 'FAILURE'
  | 'CANCELLED'
  | 'PENDING_CANCELLATION';

/**
 * Migration entity mapping configuration
 */
export interface MigrationEntityMapping {
  /** A `jq` expression used to get data from the source blueprint, to be used as an identifier for the entity */
  identifier?: string;
  /** A `jq` expression used to get data from the source blueprint, to be used as the title of the entity */
  title?: string;
  /** The icon of the entity */
  icon?: string;
  /** The team the entity belongs to */
  team?: string;
  /** An object containing the properties of the entity and their values */
  properties?: Record<string, string>;
  /** An object containing the relations of the entity and their values */
  relations?: Record<string, string>;
}

/**
 * Migration mapping configuration
 */
export interface MigrationMapping {
  /** The identifier of the target blueprint */
  blueprint?: string;
  /** An optional set of conditions to filter the entities that will be migrated */
  filter?: string;
  /** A `jq` query that evaluates to an array of items, used to create multiple entities at once */
  itemsToParse?: string;
  /** Entity mapping configuration */
  entity: MigrationEntityMapping;
}

/**
 * Create migration input
 */
export interface CreateMigrationInput {
  /** The identifier of the blueprint from which the migration will be performed */
  sourceBlueprint: string;
  /** The definition used to map the data from the source blueprint into the target blueprint */
  mapping: MigrationMapping;
}

/**
 * Cancel migration input
 */
export interface CancelMigrationInput {
  /** The reason for cancelling the migration */
  reason?: string;
}

/**
 * List migrations options
 */
export interface ListMigrationsOptions {
  /** Filter by migration status */
  status?: MigrationStatus[];
  /** The identifier of the user who initiated the migration */
  actor?: string;
  /** The identifier of the blueprint associated with the migration */
  blueprint?: string;
}

/**
 * Migration entity
 * 
 * Note: The exact structure is inferred from API usage patterns.
 * The API may return additional fields not documented here.
 */
export interface Migration {
  /** Migration identifier */
  id: string;
  /** Migration status */
  status: MigrationStatus;
  /** Source blueprint identifier */
  sourceBlueprint?: string;
  /** Target blueprint identifier (from mapping) */
  targetBlueprint?: string;
  /** The identifier of the user who initiated the migration */
  actor?: string;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Completion timestamp */
  completedAt?: Date;
  /** Migration progress (0-100) */
  progress?: number;
  /** Additional migration details */
  details?: Record<string, unknown>;
  /** Error message if migration failed */
  error?: string;
}

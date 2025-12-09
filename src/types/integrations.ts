/**
 * Integration related types
 * 
 * Types for managing Port.io integrations (data sources like AWS, GCP, Kubernetes, etc.)
 */

/**
 * Integration configuration options
 */
export interface IntegrationConfig {
  /** If true, deleting an entity will also delete its dependent entities */
  deleteDependentEntities?: boolean;
  /** If true, creating an entity with a relation to a non-existing entity will also create the related entity */
  createMissingRelatedEntities?: boolean;
  /** The mapping definition of resources from the integrated tool/platform into Port */
  resources?: IntegrationResourceMapping[];
  [key: string]: unknown;
}

/**
 * Integration resource mapping
 */
export interface IntegrationResourceMapping {
  /** The kind of resource to map, as defined in API of the integrated tool/platform */
  kind: string;
  selector: {
    /** A jq query used to specify which resources to fetch from the integrated tool/platform */
    query?: string;
  };
  /** An object containing the mapping definitions of the kind resource into Port */
  port: {
    entity: {
      /** The mapping definitions used to map the resource fields into Port entities */
      mappings: IntegrationEntityMapping | IntegrationEntityMapping[];
    };
  };
}

/**
 * Integration entity mapping
 */
export interface IntegrationEntityMapping {
  /** Entity identifier mapping (can be a string or a combinator expression) */
  identifier: string | {
    combinator: string;
    rules: Record<string, unknown>[];
  };
  /** A jq expression used to get data from the integrated tool's API, to be used as the title of the entity */
  title?: string;
  /** The identifier of the blueprint to map the data into */
  blueprint: string;
  /** An object containing the properties of the entity and their values */
  properties?: Record<string, unknown>;
  /** An object containing the relations of the entity and their values */
  relations?: Record<string, unknown>;
}

/**
 * Integration changelog destination
 */
export interface IntegrationChangelogDestination {
  type?: 'WEBHOOK' | 'KAFKA';
  /** If true, Port's execution agent will be used to send the changelog (for WEBHOOK type) */
  agent?: boolean;
  /** The URL of the webhook (for WEBHOOK type) */
  url?: string;
}

/**
 * Integration log entry
 */
export interface IntegrationLog {
  /** The identifier of the log */
  log_id?: string;
  /** The timestamp of the log entry */
  timestamp?: string;
  /** The log message */
  message?: string;
  /** The log level */
  level?: string;
  /** Additional log data */
  data?: Record<string, unknown>;
}

/**
 * Integration log query options
 */
export interface IntegrationLogOptions {
  /** The number of logs to fetch per page */
  limit?: number;
  /** The date of time from which to fetch the logs, in ISO format */
  timestamp?: string;
  /** The identifier of the log */
  log_id?: string;
  /** Determines whether to fetch logs before or after the specified timestamp */
  direction?: 'up' | 'down';
}

/**
 * Integration entity
 */
export interface Integration {
  /** The unique identifier of the integration */
  identifier: string;
  /** The installation ID of the integration */
  installationId?: string;
  /** The log ingest ID of the integration */
  logIngestId?: string;
  /** The title of the integration */
  title?: string;
  /** The name of the integrated tool/platform (e.g. kubernetes, pagerduty) */
  installationAppType?: string;
  /** The version of the integration */
  version?: string;
  /** Integration specification */
  spec?: Record<string, unknown>;
  /** If true, this integration will be able to process actions runs */
  actionsProcessingEnabled?: boolean;
  /** Various configuration options for the integration */
  config?: IntegrationConfig | null;
  /** The destination of the integration's changelog */
  changelogDestination?: IntegrationChangelogDestination;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Input for updating an integration
 */
export interface UpdateIntegrationInput {
  /** The title of the integration */
  title?: string | null;
  /** The name of the integrated tool/platform */
  installationAppType?: string;
  /** The version of the integration */
  version?: string;
  /** Integration specification */
  spec?: Record<string, unknown>;
  /** If true, this integration will be able to process actions runs */
  actionsProcessingEnabled?: boolean;
  /** Various configuration options for the integration */
  config?: IntegrationConfig | null;
  /** The destination of the integration's changelog */
  changelogDestination?: IntegrationChangelogDestination;
  [key: string]: unknown;
}

/**
 * Input for updating integration config only
 */
export interface UpdateIntegrationConfigInput {
  /** Various configuration options for the integration */
  config: IntegrationConfig | null;
}

/**
 * Options for listing integrations
 */
export interface ListIntegrationsOptions {
  /** Filter by integrations that have actions processing enabled */
  actionsProcessingEnabled?: boolean;
}

/**
 * Options for getting an integration
 */
export interface GetIntegrationOptions {
  /** The field used to identify the integration */
  byField?: 'installationId' | 'logIngestId';
}

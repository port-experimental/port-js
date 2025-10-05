/**
 * Webhook related types
 */

/**
 * Webhook entity
 */
export interface Webhook {
  /** Unique identifier */
  identifier: string;
  /** Webhook title */
  title: string;
  /** Description */
  description?: string;
  /** Icon */
  icon?: string;
  /** Whether webhook is enabled */
  enabled: boolean;
  /** Integration type */
  integrationType?: string;
  /** URL endpoint */
  url?: string;
  /** Webhook mappings */
  mappings?: unknown[];
  /** Security settings */
  security?: {
    secret?: string;
    signatureHeaderName?: string;
  };
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Input for creating a webhook
 */
export interface CreateWebhookInput {
  /** Unique identifier */
  identifier: string;
  /** Webhook title */
  title: string;
  /** Description */
  description?: string;
  /** Icon */
  icon?: string;
  /** Whether webhook is enabled */
  enabled?: boolean;
  /** Integration type */
  integrationType?: string;
  /** URL endpoint */
  url?: string;
  /** Webhook mappings */
  mappings?: unknown[];
  /** Security settings */
  security?: {
    secret?: string;
    signatureHeaderName?: string;
  };
}

/**
 * Input for updating a webhook
 */
export interface UpdateWebhookInput {
  /** Webhook title */
  title?: string;
  /** Description */
  description?: string;
  /** Icon */
  icon?: string;
  /** Whether webhook is enabled */
  enabled?: boolean;
  /** Integration type */
  integrationType?: string;
  /** URL endpoint */
  url?: string;
  /** Webhook mappings */
  mappings?: unknown[];
  /** Security settings */
  security?: {
    secret?: string;
    signatureHeaderName?: string;
  };
}


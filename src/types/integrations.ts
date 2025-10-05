/**
 * Integration related types
 */

export interface Integration {
  identifier: string;
  type: string;
  title?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateIntegrationInput {
  identifier: string;
  type: string;
  title?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface UpdateIntegrationInput {
  title?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}


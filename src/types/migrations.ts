/**
 * Migration related types
 */

export interface Migration {
  id: string;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE' | 'CANCELLED';
  type: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  progress?: number;
  details?: Record<string, unknown>;
}

export interface CreateMigrationInput {
  type: string;
  source?: Record<string, unknown>;
  target?: Record<string, unknown>;
  config?: Record<string, unknown>;
}


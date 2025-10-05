/**
 * Action-related types
 */

/**
 * Action invocation method types
 */
export type ActionInvocationMethodType =
  | 'WEBHOOK'
  | 'GITHUB'
  | 'GITLAB'
  | 'KAFKA'
  | 'AZURE_DEVOPS'
  | 'UPSERT_ENTITY';

/**
 * HTTP methods for webhook actions
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Action invocation method
 */
export interface ActionInvocationMethod {
  type: ActionInvocationMethodType;
  url?: string;
  agent?: boolean;
  synchronized?: boolean;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  org?: string;
  repo?: string;
  workflow?: string;
}

/**
 * Action trigger types
 */
export type ActionTrigger = {
  /**
   * The type of trigger
   */
  type: 'self-service';
  /**
   * The operation type of the action
   */
  operation: 'CREATE' | 'DAY-2' | 'DELETE';
  /**
   * The identifier of the blueprint that the action is associated with
   */
  blueprintIdentifier?: string;
  /**
   * The user inputs for the action
   */
  userInputs: {
    properties: Record<string, unknown>;
    required?: string[];
  };
};

/**
 * Action user input types
 */
export type ActionUserInputType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'email'
  | 'url'
  | 'entity'
  | 'datetime';

/**
 * Action user input
 */
export interface ActionUserInput {
  type: ActionUserInputType;
  title?: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: unknown[];
  format?: string;
  blueprint?: string;
  dependsOn?: string[];
  visible?: boolean | Record<string, unknown>;
}

/**
 * Action
 */
export interface Action {
  identifier: string;
  title?: string;
  description?: string;
  icon?: string;
  blueprint?: string;
  trigger?: ActionTrigger;
  invocationMethod?: ActionInvocationMethod;
  userInputs?: Record<string, ActionUserInput>;
  requiredApproval?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Create action input
 */
export interface CreateActionInput {
  identifier: string;
  title?: string;
  description?: string;
  icon?: string;
  blueprint?: string;
  trigger?: ActionTrigger;
  invocationMethod?: ActionInvocationMethod;
  userInputs?: Record<string, ActionUserInput>;
  requiredApproval?: boolean;
}

/**
 * Update action input
 */
export type UpdateActionInput = Partial<CreateActionInput>;

/**
 * Execute action input
 */
export interface ExecuteActionInput {
  properties?: Record<string, unknown>;
  relatedEntityIdentifier?: string;
}

/**
 * Action run status
 */
export type ActionRunStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE';

/**
 * Action run log entry
 */
export interface ActionRunLog {
  message: string;
  timestamp: Date;
  level?: 'INFO' | 'WARNING' | 'ERROR';
}

/**
 * Action run
 */
/**
 * Reference to an action, blueprint, or entity in run context
 */
export interface ActionRunReference {
  identifier: string;
  title?: string | null;
  icon?: string | null;
  deleted?: boolean;
}

/**
 * Action run approval information
 */
export interface ActionRunApproval {
  required: boolean;
  status?: string;
  approvers?: string[];
}

/**
 * Complete action run with all fields
 */
export interface ActionRun {
  id: string;
  status: ActionRunStatus;
  statusLabel?: string;
  action: ActionRunReference;
  blueprint?: ActionRunReference;
  entity?: ActionRunReference;
  properties?: Record<string, unknown>;
  rawProperties?: Record<string, unknown>;
  payload?: unknown;
  response?: unknown;
  summary?: string;
  link?: string;
  source?: string;
  approval?: ActionRunApproval;
  requiredApproval?: boolean;
  createdBy?: string;
  impersonatedBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}


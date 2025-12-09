/**
 * Port.io TypeScript SDK
 * 
 * @packageDocumentation
 */

// Derive VERSION from package.json at build time
// This will be replaced by tsup's define plugin during build
export const VERSION = process.env.PORT_SDK_VERSION || '0.1.0';

// Main client
export { PortClient } from './client';

// Resources (for typing and advanced usage)
export { EntityResource } from './resources/entities';
export { BlueprintResource } from './resources/blueprints';
export { ActionResource } from './resources/actions';
export { ActionRunResource } from './resources/action-runs';
export { ScorecardResource } from './resources/scorecards';
export { TeamResource } from './resources/teams';
export { UserResource } from './resources/users';
export { AuditResource } from './resources/audit';
export { WebhookResource } from './resources/webhooks';
export { IntegrationResource } from './resources/integrations';
export { OrganizationResource } from './resources/organization';
export { AppResource } from './resources/apps';
export { MigrationResource } from './resources/migrations';
export { AuthResource } from './resources/auth';

// HTTP Client (for advanced usage)
export { HttpClient } from './http-client';

// Types
export type * from './types';

// Errors
export {
  PortError,
  PortAuthError,
  PortForbiddenError,
  PortNotFoundError,
  PortValidationError,
  PortRateLimitError,
  PortServerError,
  PortNetworkError,
  PortTimeoutError,
  type ValidationError,
  type RequestContext,
} from './errors';

// Configuration
export type {
  PortClientConfig,
  PortRegion,
  PortCredentials,
  ProxyConfig,
  ResolvedConfig,
} from './config';

// Logger
export {
  Logger,
  LogLevel,
  createLogger,
  parseLogLevel,
  type LoggerConfig,
} from './logger';

// Validation utilities
export {
  validateIdentifier,
  validateIdentifierFormat,
  validateRequiredFields,
  validateIdentifiers,
  validateCreateInput,
  validateBlueprintInData,
  throwIfErrors,
  type ValidationErrorDetail,
} from './utils/validation';


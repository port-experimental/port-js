/**
 * Port.io TypeScript SDK
 * 
 * @packageDocumentation
 */

export const VERSION = '0.1.0';

// Main client
export { PortClient } from './client';

// Resources (for typing and advanced usage)
export { EntityResource } from './resources/entities';
export { BlueprintResource } from './resources/blueprints';
export { ActionResource } from './resources/actions';
export { ScorecardResource } from './resources/scorecards';

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


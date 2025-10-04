/**
 * Port.io TypeScript SDK
 * 
 * @packageDocumentation
 */

export const VERSION = '0.1.0';

// Main client
export { PortClient } from './client';

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


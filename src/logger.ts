/**
 * Cross-platform logging system for Port SDK
 * 
 * Security-first logging that:
 * - Sanitizes credentials and sensitive data
 * - Works on Windows, macOS, and Linux
 * - Supports multiple log levels
 * - Can be configured via environment variables
 * - Can be disabled in production
 */

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

/**
 * Log level names
 */
export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.TRACE]: 'TRACE',
};

/**
 * ANSI color codes for different log levels (cross-platform)
 */
const LogColors: Record<LogLevel, string> = {
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.INFO]: '\x1b[36m',  // Cyan
  [LogLevel.DEBUG]: '\x1b[35m', // Magenta
  [LogLevel.TRACE]: '\x1b[37m', // White
};

const ResetColor = '\x1b[0m';

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Minimum log level to output
   * @default LogLevel.WARN
   */
  level?: LogLevel;

  /**
   * Enable verbose logging (sets level to DEBUG)
   * @deprecated Use `level: LogLevel.DEBUG` instead. This is kept for backward compatibility.
   * @default false
   */
  verbose?: boolean;

  /**
   * Enable colored output (auto-detects terminal support)
   * @default true if terminal supports colors
   */
  colors?: boolean;

  /**
   * Include timestamp in logs
   * @default true
   */
  timestamp?: boolean;

  /**
   * Enable structured JSON output mode for log aggregation systems
   * @default false
   */
  json?: boolean;

  /**
   * Custom log output function (for testing or custom handlers)
   */
  outputFn?: (level: LogLevel, message: string, meta?: Record<string, unknown>) => void;

  /**
   * Enable logging
   * @default true in development, false in production
   */
  enabled?: boolean;

  /**
   * Configurable list of sensitive keys to redact (in addition to default list)
   */
  sensitiveKeys?: string[];
}

/**
 * Default sensitive keys to redact from logs
 * 
 * SECURITY: These keys are considered sensitive and will be replaced with [REDACTED]
 * when logging. This prevents credential leakage in logs.
 */
const DEFAULT_SENSITIVE_KEYS = [
  'password',
  'secret',
  'token',
  'apikey',
  'api_key',
  'accesstoken',
  'access_token',
  'clientsecret',
  'client_secret',
  'clientid',         // Port SDK client ID
  'client_id',        // Port SDK client ID
  'authorization',
  'auth',
  'bearer',
  'credentials',
  'private_key',
  'privatekey',
  'refresh_token',
  'refreshtoken',
];

/**
 * Check if a key is sensitive
 */
function isSensitiveKey(key: string, sensitiveKeys: readonly string[]): boolean {
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
}

/**
 * Sanitize an object by redacting sensitive values
 */
function sanitizeObject(obj: unknown, sensitiveKeys: readonly string[]): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, sensitiveKeys));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key, sensitiveKeys)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, sensitiveKeys);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Format log message with timestamp and level
 */
function formatMessage(
  level: LogLevel,
  message: string,
  useColors: boolean,
  useTimestamp: boolean
): string {
  const parts: string[] = [];

  // Add timestamp
  if (useTimestamp) {
    const timestamp = new Date().toISOString();
    parts.push(`[${timestamp}]`);
  }

  // Add log level with color
  const levelName = LogLevelNames[level];
  if (useColors) {
    parts.push(`${LogColors[level]}${levelName}${ResetColor}`);
  } else {
    parts.push(levelName);
  }

  // Add message
  parts.push(message);

  return parts.join(' ');
}

/**
 * Detect if terminal supports colors
 */
function supportsColor(): boolean {
  // Check if running in a terminal
  if (typeof process === 'undefined' || !process.stdout || !process.stdout.isTTY) {
    return false;
  }

  // Windows 10+ supports ANSI colors
  if (process.platform === 'win32') {
    return true;
  }

  // Check COLORTERM environment variable
  if (process.env.COLORTERM) {
    return true;
  }

  // Check TERM environment variable
  const term = process.env.TERM;
  if (term && (
    term.includes('color') ||
    term.includes('256') ||
    term === 'xterm' ||
    term === 'screen'
  )) {
    return true;
  }

  return false;
}

/**
 * Parse log level from environment variable or string
 */
export function parseLogLevel(level?: string): LogLevel | undefined {
  if (!level) return undefined;

  const normalized = level.toUpperCase();
  switch (normalized) {
    case 'ERROR':
      return LogLevel.ERROR;
    case 'WARN':
    case 'WARNING':
      return LogLevel.WARN;
    case 'INFO':
      return LogLevel.INFO;
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'TRACE':
      return LogLevel.TRACE;
    default:
      return undefined;
  }
}

/**
 * Logger class for Port SDK
 */
export class Logger {
  private level: LogLevel;
  private colors: boolean;
  private timestamp: boolean;
  private json: boolean;
  private outputFn: (level: LogLevel, message: string, meta?: Record<string, unknown>) => void;
  private enabled: boolean;
  private sensitiveKeys: readonly string[];

  constructor(config: LoggerConfig = {}) {
    // Unify log level mechanism - use PORT_LOG_LEVEL only (deprecate PORT_VERBOSE)
    const envLevel = parseLogLevel(process.env.PORT_LOG_LEVEL);
    // Backward compatibility: PORT_VERBOSE still works but is deprecated
    const envVerbose = process.env.PORT_VERBOSE === 'true' || process.env.PORT_VERBOSE === '1';
    
    // Determine log level - unified precedence: config.level > PORT_LOG_LEVEL > config.verbose/PORT_VERBOSE > default
    if (config.level !== undefined) {
      this.level = config.level;
    } else if (envLevel !== undefined) {
      this.level = envLevel;
    } else if (config.verbose || envVerbose) {
      // Deprecated: verbose mode
      this.level = LogLevel.DEBUG;
    } else {
      // Default to WARN
      this.level = LogLevel.WARN;
    }

    // Configure colors
    this.colors = config.colors !== undefined 
      ? config.colors 
      : supportsColor();

    // Configure timestamp
    this.timestamp = config.timestamp !== undefined 
      ? config.timestamp 
      : true;

    // Configure JSON output mode
    this.json = config.json ?? false;

    // Build sensitive keys list (default + custom)
    this.sensitiveKeys = config.sensitiveKeys 
      ? [...DEFAULT_SENSITIVE_KEYS, ...config.sensitiveKeys]
      : DEFAULT_SENSITIVE_KEYS;

    // Configure output function
    if (config.outputFn) {
      this.outputFn = config.outputFn;
    } else if (this.json) {
      // Structured JSON output for log aggregation
      this.outputFn = (level, message, meta) => {
        const sanitizedMeta = meta ? sanitizeObject(meta, this.sensitiveKeys) : {};
        const logEntry: Record<string, unknown> = {
          timestamp: new Date().toISOString(),
          level: LogLevelNames[level],
          message,
        };
        
        // Spread sanitized metadata only if it's an object
        if (typeof sanitizedMeta === 'object' && sanitizedMeta !== null && !Array.isArray(sanitizedMeta)) {
          Object.assign(logEntry, sanitizedMeta);
        }
        
        const output = JSON.stringify(logEntry);
        if (level <= LogLevel.WARN) {
          console.error(output);
        } else {
          console.log(output);
        }
      };
    } else {
      // Default text output
      this.outputFn = (level, message, meta) => {
        const formatted = formatMessage(level, message, this.colors, this.timestamp);
        const output = meta 
          ? `${formatted} ${JSON.stringify(sanitizeObject(meta, this.sensitiveKeys))}`
          : formatted;
        
        if (level <= LogLevel.WARN) {
          console.error(output);
        } else {
          console.log(output);
        }
      };
    }

    // Enable/disable logging
    const nodeEnv = process.env.NODE_ENV;
    this.enabled = config.enabled !== undefined
      ? config.enabled
      : nodeEnv !== 'production';
  }

  /**
   * Set log level at runtime
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Check if a log level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return this.enabled && level <= this.level;
  }

  /**
   * Log an error message
   */
  error(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log a debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Log a trace message
   */
  trace(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.TRACE, message, meta);
  }

  /**
   * Log a message at a specific level
   */
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    this.outputFn(level, message, meta);
  }

  /**
   * Create a child logger with a prefix
   */
  child(prefix: string): Logger {
    const childOutputFn = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
      this.outputFn(level, `[${prefix}] ${message}`, meta);
    };

    return new Logger({
      level: this.level,
      colors: this.colors,
      timestamp: this.timestamp,
      outputFn: childOutputFn,
      enabled: this.enabled,
    });
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    if (config.level !== undefined) {
      this.level = config.level;
    }
    if (config.verbose) {
      this.level = LogLevel.DEBUG;
    }
    if (config.colors !== undefined) {
      this.colors = config.colors;
    }
    if (config.timestamp !== undefined) {
      this.timestamp = config.timestamp;
    }
    if (config.outputFn !== undefined) {
      this.outputFn = config.outputFn;
    }
    if (config.enabled !== undefined) {
      this.enabled = config.enabled;
    }
  }
}

/**
 * Global default logger instance
 */
export const defaultLogger = new Logger();

/**
 * Create a new logger instance
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new Logger(config);
}


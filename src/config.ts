/**
 * Configuration module for Port SDK
 * Supports environment variables, .env files, and explicit configuration
 */

import { config as loadDotenv } from 'dotenv';
import { PortAuthError } from './errors';
import { LoggerConfig } from './logger';

/**
 * Port API regions
 */
export type PortRegion = 'eu' | 'us';

/**
 * Base URLs for different regions
 */
export const REGION_BASE_URLS: Record<PortRegion, string> = {
  eu: 'https://api.port.io',
  us: 'https://api.us.port.io',
};

/**
 * Credentials for Port API authentication
 */
export type PortCredentials =
  | { clientId: string; clientSecret: string }
  | { accessToken: string };

/**
 * Proxy configuration
 */
export interface ProxyConfig {
  /**
   * Proxy URL (e.g., 'http://proxy.example.com:8080')
   */
  url: string;

  /**
   * Proxy authentication credentials
   */
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * Port client configuration options
 */
export interface PortClientConfig {
  /**
   * Authentication credentials
   * Can be OAuth credentials (clientId + clientSecret) or JWT access token
   */
  credentials?: PortCredentials;

  /**
   * Port API base URL
   * Defaults to EU instance: https://api.port.io
   * Use 'https://api.us.port.io' for US instance
   */
  baseUrl?: string;

  /**
   * Port API region (alternative to baseUrl)
   * When set, overrides baseUrl with the appropriate regional URL
   * @default 'eu'
   */
  region?: PortRegion;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial retry delay in milliseconds (uses exponential backoff)
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Proxy configuration
   * Can also be configured via HTTP_PROXY, HTTPS_PROXY environment variables
   */
  proxy?: ProxyConfig;

  /**
   * Logger configuration
   * Can also be configured via PORT_LOG_LEVEL, PORT_VERBOSE environment variables
   */
  logger?: LoggerConfig;

  /**
   * Whether to load configuration from .env file
   * @default true
   */
  loadEnv?: boolean;

  /**
   * Path to .env file
   * @default '.env'
   */
  envPath?: string;
}

/**
 * Environment variable names for Port configuration
 */
export const ENV_VARS = {
  CLIENT_ID: 'PORT_CLIENT_ID',
  CLIENT_SECRET: 'PORT_CLIENT_SECRET',
  ACCESS_TOKEN: 'PORT_ACCESS_TOKEN',
  BASE_URL: 'PORT_BASE_URL',
  REGION: 'PORT_REGION',
  TIMEOUT: 'PORT_TIMEOUT',
  MAX_RETRIES: 'PORT_MAX_RETRIES',
  HTTP_PROXY: 'HTTP_PROXY',
  HTTPS_PROXY: 'HTTPS_PROXY',
  NO_PROXY: 'NO_PROXY',
  PROXY_AUTH_USERNAME: 'PROXY_AUTH_USERNAME',
  PROXY_AUTH_PASSWORD: 'PROXY_AUTH_PASSWORD',
  LOG_LEVEL: 'PORT_LOG_LEVEL',
  VERBOSE: 'PORT_VERBOSE',
} as const;

/**
 * Load credentials from environment variables
 */
function loadCredentialsFromEnv(): PortCredentials | undefined {
  const clientId = process.env[ENV_VARS.CLIENT_ID];
  const clientSecret = process.env[ENV_VARS.CLIENT_SECRET];
  const accessToken = process.env[ENV_VARS.ACCESS_TOKEN];

  // Priority: OAuth credentials > Access token
  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }

  if (accessToken) {
    return { accessToken };
  }

  return undefined;
}

/**
 * Load base URL from environment or region
 */
function loadBaseUrlFromEnv(): string | undefined {
  const baseUrl = process.env[ENV_VARS.BASE_URL];
  if (baseUrl) {
    return baseUrl;
  }

  const region = process.env[ENV_VARS.REGION];
  if (region && (region === 'eu' || region === 'us')) {
    return REGION_BASE_URLS[region];
  }

  return undefined;
}

/**
 * Load proxy configuration from environment variables
 */
function loadProxyFromEnv(targetUrl: string): ProxyConfig | undefined {
  // Determine which proxy variable to use based on target URL protocol
  const isHttps = targetUrl.startsWith('https://');
  const proxyUrl = isHttps
    ? process.env[ENV_VARS.HTTPS_PROXY] || process.env[ENV_VARS.HTTP_PROXY]
    : process.env[ENV_VARS.HTTP_PROXY];

  if (!proxyUrl) {
    return undefined;
  }

  // Check NO_PROXY environment variable
  const noProxy = process.env[ENV_VARS.NO_PROXY];
  if (noProxy && shouldBypassProxy(targetUrl, noProxy)) {
    return undefined;
  }

  // Parse proxy authentication from URL or separate env vars
  const proxyUrlObj = new URL(proxyUrl);
  const username = proxyUrlObj.username || process.env[ENV_VARS.PROXY_AUTH_USERNAME];
  const password = proxyUrlObj.password || process.env[ENV_VARS.PROXY_AUTH_PASSWORD];

  // Remove auth from URL if present (we'll handle it separately)
  const cleanProxyUrl = proxyUrlObj.username
    ? `${proxyUrlObj.protocol}//${proxyUrlObj.host}`
    : proxyUrl;

  return {
    url: cleanProxyUrl,
    auth: username && password ? { username, password } : undefined,
  };
}

/**
 * Check if a URL should bypass the proxy based on NO_PROXY rules
 */
function shouldBypassProxy(targetUrl: string, noProxyRules: string): boolean {
  try {
    const url = new URL(targetUrl);
    const hostname = url.hostname;
    
    // Split NO_PROXY by comma and check each rule
    const rules = noProxyRules.split(',').map(rule => rule.trim().toLowerCase());
    
    for (const rule of rules) {
      if (!rule) continue;
      
      // Exact match
      if (hostname === rule) {
        return true;
      }
      
      // Wildcard domain match (e.g., .example.com matches api.example.com)
      if (rule.startsWith('.') && hostname.endsWith(rule)) {
        return true;
      }
      
      // Domain suffix match (e.g., example.com matches api.example.com)
      if (hostname.endsWith(`.${rule}`)) {
        return true;
      }
      
      // Wildcard match
      if (rule === '*') {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Resolved configuration with all defaults applied
 */
export interface ResolvedConfig {
  credentials: PortCredentials;
  baseUrl: string;
  region: PortRegion;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  proxy?: ProxyConfig;
  logger?: LoggerConfig;
}

/**
 * Resolve configuration from multiple sources with precedence:
 * 1. Explicit config object
 * 2. Environment variables
 * 3. Defaults (EU region, 30s timeout, 3 retries)
 */
export function resolveConfig(config?: PortClientConfig): ResolvedConfig {
  // Load .env file if requested (default: true)
  const shouldLoadEnv = config?.loadEnv !== false;
  if (shouldLoadEnv) {
    loadDotenv({ path: config?.envPath || '.env' });
  }

  // Resolve credentials with precedence: config > env
  let credentials = config?.credentials;
  if (!credentials) {
    credentials = loadCredentialsFromEnv();
  }

  if (!credentials) {
    throw new PortAuthError(
      'No credentials provided. Please provide credentials via:\n' +
      '1. Config object: { credentials: { clientId, clientSecret } } or { credentials: { accessToken } }\n' +
      '2. Environment variables: PORT_CLIENT_ID + PORT_CLIENT_SECRET or PORT_ACCESS_TOKEN\n' +
      '3. .env file with PORT_CLIENT_ID + PORT_CLIENT_SECRET or PORT_ACCESS_TOKEN'
    );
  }

  // Resolve base URL and region with precedence: config.baseUrl > config.region > env > default (EU)
  let baseUrl: string;
  let region: PortRegion;
  
  if (config?.baseUrl) {
    baseUrl = config.baseUrl;
    // Infer region from base URL
    region = baseUrl.includes('us.port.io') ? 'us' : 'eu';
  } else if (config?.region) {
    region = config.region;
    baseUrl = REGION_BASE_URLS[region];
  } else {
    const envBaseUrl = loadBaseUrlFromEnv();
    if (envBaseUrl) {
      baseUrl = envBaseUrl;
      region = envBaseUrl.includes('us.port.io') ? 'us' : 'eu';
    } else {
      // Default to EU region
      region = 'eu';
      baseUrl = REGION_BASE_URLS.eu;
    }
  }

  // Resolve proxy with precedence: config > env
  let proxy = config?.proxy;
  if (!proxy) {
    proxy = loadProxyFromEnv(baseUrl);
  }

  // Resolve other config options
  const timeout = config?.timeout 
    || (process.env[ENV_VARS.TIMEOUT] ? parseInt(process.env[ENV_VARS.TIMEOUT]!, 10) : undefined)
    || 30000;

  const maxRetries = config?.maxRetries
    || (process.env[ENV_VARS.MAX_RETRIES] ? parseInt(process.env[ENV_VARS.MAX_RETRIES]!, 10) : undefined)
    || 3;

  const retryDelay = config?.retryDelay || 1000;

  // Logger configuration
  const logger = config?.logger;

  return {
    credentials,
    baseUrl,
    region,
    timeout,
    maxRetries,
    retryDelay,
    proxy,
    logger,
  };
}

/**
 * Validate that credentials are present in environment
 * Useful for checking configuration before initializing the client
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const hasOAuthCreds = !!(process.env[ENV_VARS.CLIENT_ID] && process.env[ENV_VARS.CLIENT_SECRET]);
  const hasAccessToken = !!process.env[ENV_VARS.ACCESS_TOKEN];

  if (!hasOAuthCreds && !hasAccessToken) {
    errors.push(
      'Missing credentials in environment. Please set either:\n' +
      `  - ${ENV_VARS.CLIENT_ID} and ${ENV_VARS.CLIENT_SECRET}, or\n` +
      `  - ${ENV_VARS.ACCESS_TOKEN}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get the current configuration from environment
 * Useful for debugging or displaying current config
 */
export function getCurrentConfig(): {
  hasCredentials: boolean;
  credentialType: 'oauth' | 'jwt' | 'none';
  baseUrl: string;
  region: PortRegion;
} {
  const hasOAuthCreds = !!(process.env[ENV_VARS.CLIENT_ID] && process.env[ENV_VARS.CLIENT_SECRET]);
  const hasAccessToken = !!process.env[ENV_VARS.ACCESS_TOKEN];

  let credentialType: 'oauth' | 'jwt' | 'none' = 'none';
  if (hasOAuthCreds) {
    credentialType = 'oauth';
  } else if (hasAccessToken) {
    credentialType = 'jwt';
  }

  const baseUrl = loadBaseUrlFromEnv() || REGION_BASE_URLS.eu;
  const region: PortRegion = baseUrl.includes('us.port.io') ? 'us' : 'eu';

  return {
    hasCredentials: hasOAuthCreds || hasAccessToken,
    credentialType,
    baseUrl,
    region,
  };
}


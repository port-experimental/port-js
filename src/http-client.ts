/**
 * HTTP client for Port API with authentication, retries, and error handling
 */

import { ProxyAgent } from 'undici';
import {
  PortError,
  PortAuthError,
  PortForbiddenError,
  PortNotFoundError,
  PortValidationError,
  PortRateLimitError,
  PortServerError,
  PortNetworkError,
  PortTimeoutError,
  ValidationError,
} from './errors';
import { PortCredentials, ProxyConfig } from './config';
import { Logger, createLogger, LoggerConfig } from './logger';

/**
 * HTTP client configuration
 */
export interface HttpClientConfig {
  credentials: PortCredentials;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  proxy?: ProxyConfig;
  logger?: LoggerConfig;
  /**
   * Custom fetch implementation (for testability and flexibility)
   * Defaults to global fetch
   */
  fetch?: typeof fetch;
}

/**
 * Request options
 */
export interface RequestOptions {
  timeout?: number;
  skipRetry?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /**
   * Query parameters for GET/DELETE requests
   */
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * Token response from Port API
 */
interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * HTTP client for Port API
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly credentials: PortCredentials;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly proxyAgent?: ProxyAgent;
  private readonly logger: Logger;
  private readonly fetchImpl: typeof fetch;
  private accessToken?: string;
  private tokenExpiry?: Date;
  private refreshPromise?: Promise<string>;

  constructor(config: HttpClientConfig) {
    this.credentials = config.credentials;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.maxRetries = config.maxRetries;
    this.retryDelay = config.retryDelay;
    this.fetchImpl = config.fetch || fetch;
    
    // Initialize logger
    this.logger = createLogger(config.logger).child('HttpClient');
    
    // Initialize proxy agent if proxy is configured
    if (config.proxy) {
      this.logger.debug('Initializing proxy agent', { 
        proxyUrl: config.proxy.url,
        hasAuth: !!config.proxy.auth 
      });
      
      let proxyUrl: string;
      if (config.proxy.auth) {
        // Use URL API for proper encoding of credentials
        const url = new URL(config.proxy.url);
        url.username = encodeURIComponent(config.proxy.auth.username);
        url.password = encodeURIComponent(config.proxy.auth.password);
        proxyUrl = url.toString();
      } else {
        proxyUrl = config.proxy.url;
      }
      
      this.proxyAgent = new ProxyAgent(proxyUrl);
    }
    
    this.logger.info('HTTP client initialized', { 
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      hasProxy: !!this.proxyAgent 
    });
  }

  /**
   * Get access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    // If credentials contain an access token directly, use it
    if ('accessToken' in this.credentials) {
      return this.credentials.accessToken;
    }

    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      this.logger.debug('Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // Start a new token refresh and store the promise
    this.refreshPromise = this.refreshToken()
      .then((token) => {
        this.refreshPromise = undefined;
        return token;
      })
      .catch((error) => {
        this.refreshPromise = undefined;
        throw error;
      });

    return this.refreshPromise;
  }

  /**
   * Refresh access token using client credentials
   */
  private async refreshToken(): Promise<string> {
    if (!('clientId' in this.credentials)) {
      throw new PortAuthError('Cannot refresh token without client credentials');
    }

    this.logger.debug('Refreshing access token');

    // Add timeout to token refresh to avoid hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetchImpl(`${this.baseUrl}/v1/auth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.credentials.clientId,
          clientSecret: this.credentials.clientSecret,
        }),
        signal: controller.signal,
        // @ts-expect-error - dispatcher is valid but not in types
        dispatcher: this.proxyAgent,
      });

      if (!response.ok) {
        const body = await this.parseErrorResponse(response);
        this.logger.error('Token refresh failed', { status: response.status });
        throw new PortAuthError(
          body.message || 'Failed to authenticate',
          body
        );
      }

      const data = (await response.json()) as TokenResponse;
      this.accessToken = data.accessToken;
      
      // Set expiry to 5 minutes before actual expiry for safety
      const expiryMs = (data.expiresIn - 300) * 1000;
      this.tokenExpiry = new Date(Date.now() + expiryMs);

      this.logger.debug('Access token refreshed successfully', { 
        expiresIn: data.expiresIn 
      });

      return this.accessToken;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new PortTimeoutError(
          `Token refresh timeout after ${this.timeout}ms`,
          this.timeout
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<{
    message?: string;
    statusCode?: number;
    error?: string;
    resource?: string;
    identifier?: string;
    errors?: unknown;
    [key: string]: unknown;
  }> {
    try {
      const json = await response.json() as Record<string, unknown>;
      return json as {
        message?: string;
        statusCode?: number;
        error?: string;
        resource?: string;
        identifier?: string;
        errors?: unknown;
        [key: string]: unknown;
      };
    } catch {
      return {
        message: response.statusText || 'An error occurred',
        statusCode: response.status,
      };
    }
  }

  /**
   * Handle API errors and throw appropriate error types
   */
  private async handleError(response: Response, method: string, path: string): Promise<never> {
    const body = await this.parseErrorResponse(response);
    
    // Propagate server-provided request ID from headers for debugging correlation
    const serverRequestId = response.headers.get('X-Request-Id') || 
                            response.headers.get('Request-Id') ||
                            response.headers.get('X-Correlation-Id');
    
    // Create request context for debugging
    const context = {
      method,
      url: path,
      requestId: serverRequestId || `${method}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };

    switch (response.status) {
      case 401:
        throw new PortAuthError(
          body.message || 'Authentication failed',
          body,
          context
        );
      case 403:
        throw new PortForbiddenError(
          body.message || 'Forbidden',
          undefined,
          body,
          context
        );
      case 404:
        throw new PortNotFoundError(
          body.resource || 'Resource',
          body.identifier || 'unknown',
          body,
          context
        );
      case 422:
        throw new PortValidationError(
          body.message || 'Validation failed',
          (body.errors as ValidationError[]) || [],
          context
        );
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new PortRateLimitError(
          body.message || 'Rate limit exceeded',
          retryAfter ? parseInt(retryAfter, 10) : undefined,
          body,
          context
        );
      default:
        if (response.status >= 500) {
          throw new PortServerError(
            body.message || 'Server error',
            response.status,
            body,
            context
          );
        }
        throw new PortError(
          body.message || 'An error occurred',
          body.error,
          response.status,
          body,
          context
        );
    }
  }

  /**
   * Check if HTTP method is idempotent
   */
  private isIdempotentMethod(method: string): boolean {
    // GET, HEAD, PUT, DELETE, OPTIONS, TRACE are idempotent
    // POST, PATCH are not idempotent
    return ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].includes(method.toUpperCase());
  }

  /**
   * Should retry based on error and method
   */
  private shouldRetry(error: unknown, attempt: number, method: string): boolean {
    if (attempt >= this.maxRetries) {
      return false;
    }

    // Differentiate idempotent vs non-idempotent methods (avoid retrying POSTs by default)
    // Only retry non-idempotent methods for network errors and timeouts
    if (!this.isIdempotentMethod(method)) {
      // For POST/PATCH, only retry on network errors or timeouts
      return error instanceof PortNetworkError || error instanceof PortTimeoutError;
    }

    // For idempotent methods, retry on network/server errors
    // Retry network errors
    if (error instanceof PortNetworkError) {
      return true;
    }

    // Retry server errors (5xx)
    if (error instanceof PortServerError) {
      return true;
    }

    // Retry rate limit errors
    if (error instanceof PortRateLimitError) {
      return true;
    }

    // Retry timeout errors
    if (error instanceof PortTimeoutError) {
      return true;
    }

    // Don't retry client errors (4xx)
    return false;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private getRetryDelay(attempt: number, error: unknown): number {
    // If rate limit error with Retry-After header, use that
    if (error instanceof PortRateLimitError && error.retryAfter) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff: delay * 2^attempt
    const baseDelay = this.retryDelay * Math.pow(2, attempt);
    
    // Add jitter to avoid thundering herd issues (random between 0 and 25% of delay)
    const jitter = Math.random() * baseDelay * 0.25;
    
    return baseDelay + jitter;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute HTTP request with retries
   */
  private async executeRequest<T>(
    method: string,
    path: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    // Use URL() for safer URL building instead of string concatenation
    const urlObj = new URL(path, this.baseUrl);
    
    // Add query parameters if provided
    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, String(value));
        }
      }
    }
    
    const url = urlObj.toString();
    const timeout = options?.timeout || this.timeout;
    const skipRetry = options?.skipRetry || false;

    let attempt = 0;
    let lastError: unknown;

    while (attempt < this.maxRetries) {
      let timeoutId: NodeJS.Timeout | undefined;
      try {
        // Get access token
        const token = await this.getAccessToken();

        this.logger.debug(`${method} ${path}`, { 
          attempt: attempt + 1,
          hasData: !!data 
        });

        // Create abort controller for timeout
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), timeout);

        // If user provided a signal, abort our controller if it's aborted
        if (options?.signal) {
          if (options.signal.aborted) {
            controller.abort(options.signal.reason);
          } else {
            options.signal.addEventListener('abort', () => {
              controller.abort(options.signal!.reason);
            }, { once: true });
          }
        }

        // Make request using injected fetch implementation
        const response = await this.fetchImpl(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
          // @ts-expect-error - dispatcher is valid but not in types
          dispatcher: this.proxyAgent,
        });

        // Clear timeout in finally block to prevent timer leaks
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        this.logger.debug(`Response ${method} ${path}`, { 
          status: response.status,
          attempt: attempt + 1 
        });

        // Handle error responses
        if (!response.ok) {
          await this.handleError(response, method, path);
        }

        // Parse and return response
        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error;
        
        // Clear timeout in catch block as well
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        this.logger.warn(`Request failed: ${method} ${path}`, { 
          attempt: attempt + 1,
          error: error instanceof Error ? error.message : String(error) 
        });

        // Handle abort
        if (error instanceof Error && error.name === 'AbortError') {
          // Check if it was user-initiated cancellation
          if (options?.signal?.aborted) {
            // User cancelled the request
            throw error; // Re-throw the cancellation error
          }
          // Otherwise it was a timeout
          const context = {
            method,
            url: path,
            requestId: `${method}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          };
          const timeoutError = new PortTimeoutError(
            `Request timeout after ${timeout}ms`,
            timeout,
            context
          );
          lastError = timeoutError;
        }

        // Handle network errors
        if (error instanceof TypeError) {
          const context = {
            method,
            url: path,
            requestId: `${method}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          };
          lastError = new PortNetworkError(
            'Network error occurred',
            error,
            context
          );
        }

        // Check if should retry
        if (skipRetry || !this.shouldRetry(lastError, attempt, method)) {
          this.logger.error(`Request failed permanently: ${method} ${path}`, { 
            attempt: attempt + 1,
            error: lastError instanceof Error ? lastError.message : String(lastError) 
          });
          throw lastError;
        }

        // Calculate retry delay
        const delay = this.getRetryDelay(attempt, lastError);
        this.logger.info(`Retrying request: ${method} ${path}`, { 
          attempt: attempt + 1,
          delay 
        });
        await this.sleep(delay);

        attempt++;
      } finally {
        // Always clear timeout to prevent timer leaks
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }

    this.logger.error(`Request failed after max retries: ${method} ${path}`, { 
      attempts: this.maxRetries 
    });
    throw lastError;
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>('GET', path, undefined, options);
  }

  /**
   * POST request
   */
  async post<T>(
    path: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.executeRequest<T>('POST', path, data, options);
  }

  /**
   * PUT request
   */
  async put<T>(
    path: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.executeRequest<T>('PUT', path, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.executeRequest<T>('PATCH', path, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>('DELETE', path, undefined, options);
  }
}


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
}

/**
 * Request options
 */
export interface RequestOptions {
  timeout?: number;
  skipRetry?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
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
  private accessToken?: string;
  private tokenExpiry?: Date;
  private refreshPromise?: Promise<string>;

  constructor(config: HttpClientConfig) {
    this.credentials = config.credentials;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.maxRetries = config.maxRetries;
    this.retryDelay = config.retryDelay;
    
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

    const response = await fetch(`${this.baseUrl}/v1/auth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: this.credentials.clientId,
        clientSecret: this.credentials.clientSecret,
      }),
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
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json();
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
    
    // Create request context for debugging
    const context = {
      method,
      url: path,
      requestId: `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
   * Should retry based on error
   */
  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.maxRetries) {
      return false;
    }

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

    // Don't retry client errors (4xx)
    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private getRetryDelay(attempt: number, error: unknown): number {
    // If rate limit error with Retry-After header, use that
    if (error instanceof PortRateLimitError && error.retryAfter) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff: delay * 2^attempt
    return this.retryDelay * Math.pow(2, attempt);
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
    const url = `${this.baseUrl}${path}`;
    const timeout = options?.timeout || this.timeout;
    const skipRetry = options?.skipRetry || false;

    let attempt = 0;
    let lastError: unknown;

    while (attempt < this.maxRetries) {
      try {
        // Get access token
        const token = await this.getAccessToken();

        this.logger.debug(`${method} ${path}`, { 
          attempt: attempt + 1,
          hasData: !!data 
        });

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

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

        // Make request
        const response = await fetch(url, {
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

        clearTimeout(timeoutId);

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
            requestId: `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            requestId: `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          lastError = new PortNetworkError(
            'Network error occurred',
            error,
            context
          );
        }

        // Check if should retry
        if (skipRetry || !this.shouldRetry(lastError, attempt)) {
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


/**
 * Base resource class with common functionality
 */

import { HttpClient } from '../http-client';
import { PaginationOptions, PaginatedResponse } from '../types';

/**
 * API paginated response
 */
interface ApiPaginatedResponse<T> {
  entities?: T[];
  blueprints?: T[];
  actions?: T[];
  scorecards?: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore?: boolean;
  nextCursor?: string;
}

/**
 * Base resource class
 */
export abstract class BaseResource {
  constructor(protected httpClient: HttpClient) {}

  /**
   * Build URL with query parameters
   */
  protected buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | string[] | undefined>
  ): string {
    if (!params) return path;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query.append(key, value.join(','));
        } else {
          query.append(key, String(value));
        }
      }
    }

    const queryString = query.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

  /**
   * Paginate through results
   */
  protected async paginate<T>(
    path: string,
    options?: PaginationOptions,
    dataKey: keyof ApiPaginatedResponse<T> = 'entities' as keyof ApiPaginatedResponse<T>
  ): Promise<PaginatedResponse<T>> {
    const url = this.buildUrl(path, {
      limit: options?.limit,
      offset: options?.offset,
      cursor: options?.cursor,
    });

    const response = await this.httpClient.get<ApiPaginatedResponse<T>>(url);

    return {
      data: (response[dataKey] as T[]) || [],
      pagination: {
        total: response.total || 0,
        limit: response.limit || 50,
        offset: response.offset || 0,
        hasMore: response.hasMore || false,
        nextCursor: response.nextCursor,
      },
    };
  }
}


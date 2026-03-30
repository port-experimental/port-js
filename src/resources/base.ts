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
 * 
 * ## Return Type Standards
 * 
 * All resource classes follow these return type conventions:
 * - **Single items** (`create`, `get`, `update`): Return `Promise<T>`
 * - **Delete operations**: Return `Promise<void>`
 * - **List operations with pagination**: Return `Promise<PaginatedResponse<T>>` (includes metadata)
 * - **List operations without pagination**: Return `Promise<T[]>` (simple array)
 * 
 * The return type depends on what the Port API provides for that endpoint.
 */
export abstract class BaseResource {
  constructor(protected httpClient: HttpClient) { }

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

  /**
   * Iterate through all pages of results
   *
   * @param path - API path
   * @param options - Pagination options
   * @param dataKey - Key in response containing the data array
   * @yields Items from each page
   */
  protected async *streamPaginated<T>(
    path: string,
    options?: PaginationOptions,
    dataKey: keyof ApiPaginatedResponse<T> = 'entities' as keyof ApiPaginatedResponse<T>
  ): AsyncIterableIterator<T> {
    let currentOffset = options?.offset || 0;
    let currentCursor = options?.cursor;
    let hasMore = true;

    while (hasMore) {
      const response = await this.paginate<T>(
        path,
        {
          ...options,
          offset: currentOffset,
          cursor: currentCursor,
        },
        dataKey
      );

      for (const item of response.data) {
        yield item;
      }

      hasMore = response.pagination.hasMore;
      currentCursor = response.pagination.nextCursor;
      currentOffset += response.data.length;

      if (!hasMore || response.data.length === 0) {
        break;
      }
    }
  }
}


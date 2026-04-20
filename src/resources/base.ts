/**
 * Base resource class with common functionality
 */

import { HttpClient } from '../http-client';
import { PaginationOptions, PaginatedResponse } from '../types';

interface ApiPaginatedResponse<T> {
  [key: string]: T[] | number | boolean | string | undefined;
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

    const [basePath, existingQuery] = path.split('?');
    const query = new URLSearchParams(existingQuery);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        // Only add if not already present to avoid duplication
        if (!query.has(key)) {
          if (Array.isArray(value)) {
            query.append(key, value.join(','));
          } else {
            query.append(key, String(value));
          }
        }
      }
    }

    const queryString = query.toString();
    return queryString ? `${basePath}?${queryString}` : basePath!;
  }

  /**
   * Paginate through results
   */
  protected async paginate<T>(
    path: string,
    options?: PaginationOptions,
    dataKey = 'entities'
  ): Promise<PaginatedResponse<T>> {
    const url = this.buildUrl(path, { ...options });

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
    dataKey = 'entities'
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

      if (response.data.length === 0) {
        break;
      }
    }
  }

  protected transformTimestamps<T extends object>(obj: T): T {
    const result = obj as Record<string, unknown>;
    return {
      ...obj,
      createdAt: result['createdAt'] != null ? new Date(result['createdAt'] as string) : undefined,
      updatedAt: result['updatedAt'] != null ? new Date(result['updatedAt'] as string) : undefined,
    } as T;
  }
}


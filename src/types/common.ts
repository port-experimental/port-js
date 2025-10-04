/**
 * Common types and utilities
 */

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

/**
 * Search query operators
 */
export type SearchOperator =
  | '='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'contains'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn'
  | 'between'
  | 'notBetween';

/**
 * Search rule
 */
export interface SearchRule {
  property: string;
  operator: SearchOperator;
  value?: unknown;
}

/**
 * Search query combinator
 */
export type SearchCombinator = 'and' | 'or';


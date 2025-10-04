/**
 * Mock factories and helpers for tests
 */
import { vi } from 'vitest';

/**
 * Create a mock HttpClient for testing
 */
export function createMockHttpClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  };
}

/**
 * Create a mock entity with default values
 */
export function createMockEntity(overrides: Record<string, unknown> = {}) {
  return {
    identifier: 'test-entity',
    blueprint: 'service',
    title: 'Test Entity',
    properties: {
      stringProps: {},
      numberProps: {},
      booleanProps: {},
    },
    relations: {
      singleRelations: {},
      manyRelations: {},
    },
    createdAt: new Date('2025-10-03T00:00:00Z'),
    updatedAt: new Date('2025-10-03T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Create a mock paginated response
 */
export function createMockPaginatedResponse<T>(data: T[], overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    data,
    total: data.length,
    limit: 50,
    offset: 0,
    hasMore: false,
    ...overrides,
  };
}

/**
 * Create mock Port API error response
 */
export function createMockErrorResponse(status: number, message: string, error?: string) {
  return {
    ok: false,
    error: error || 'error',
    message,
    status,
  };
}

/**
 * Helper to delay execution (for testing async behavior)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


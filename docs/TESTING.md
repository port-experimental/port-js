# Testing Guide for Port SDK

This guide covers testing strategies, best practices, and patterns for the Port SDK.

## 🎯 Testing Philosophy

- **Comprehensive**: Cover all code paths
- **Fast**: Unit tests run in <5s, integration tests in <30s
- **Isolated**: No shared state between tests
- **Deterministic**: Same input = same output
- **Secure**: No credentials in test code

## 📁 Test Structure

```
tests/
├── unit/                          # Fast, isolated tests
│   ├── errors.test.ts            # Error classes
│   ├── logger.test.ts            # Logging system
│   ├── config.test.ts            # Configuration
│   ├── http-client.test.ts       # HTTP client
│   └── resources/                # Resource classes
│       ├── entities.test.ts
│       ├── blueprints.test.ts
│       ├── actions.test.ts
│       └── scorecards.test.ts
├── integration/                   # Real API tests
│   ├── setup.ts                  # Test setup/teardown
│   ├── entities.integration.test.ts
│   ├── blueprints.integration.test.ts
│   └── end-to-end.integration.test.ts
├── fixtures/                      # Test data
│   ├── entities.ts               # Sample entities
│   ├── blueprints.ts             # Sample blueprints
│   └── responses.ts              # Mock API responses
└── helpers/                       # Test utilities
    ├── mocks.ts                  # Mock factories
    ├── assertions.ts             # Custom matchers
    └── cleanup.ts                # Cleanup utilities
```

## 🧪 Unit Testing

### Writing Unit Tests

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntityResource } from '../../src/resources/entities';
import { createMockHttpClient } from '../helpers/mocks';
import { validEntity, invalidEntity } from '../fixtures/entities';

describe('EntityResource', () => {
  let mockHttpClient: HttpClient;
  let entityResource: EntityResource;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockHttpClient = createMockHttpClient();
    entityResource = new EntityResource(mockHttpClient);
  });

  describe('create()', () => {
    it('should create entity with valid data', async () => {
      const expected = { ...validEntity, createdAt: new Date() };
      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await entityResource.create(validEntity);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/entities',
        validEntity
      );
      expect(result).toEqual(expected);
    });

    it('should throw ValidationError for invalid data', async () => {
      await expect(entityResource.create(invalidEntity))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should handle network errors with retry', async () => {
      const networkError = new Error('ECONNRESET');
      
      vi.mocked(mockHttpClient.post)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue({ identifier: 'test' });

      const result = await entityResource.create(validEntity);
      
      expect(result.identifier).toBe('test');
      expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Running Unit Tests

```bash
# Run all unit tests
pnpm test

# Watch mode (re-run on file changes)
pnpm test:watch

# With coverage
pnpm test:coverage

# Specific file
pnpm test src/resources/entities

# Visual UI
pnpm test:ui
```

## 🔗 Integration Testing

### Writing Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PortClient } from '../../src';

// Only run if credentials available
const hasCredentials = !!(
  process.env.PORT_CLIENT_ID && 
  process.env.PORT_CLIENT_SECRET
);

describe.skipIf(!hasCredentials)('Entity Integration', () => {
  let client: PortClient;
  const testPrefix = `test-${Date.now()}`;
  const createdResources: string[] = [];

  beforeAll(() => {
    client = new PortClient({
      credentials: {
        clientId: process.env.PORT_CLIENT_ID!,
        clientSecret: process.env.PORT_CLIENT_SECRET!,
      },
    });
  });

  afterAll(async () => {
    // Clean up all test resources
    for (const id of createdResources) {
      try {
        await client.entities.delete(id);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it('should perform full CRUD cycle', async () => {
    const identifier = `${testPrefix}-service-1`;
    
    // Create
    const created = await client.entities.create({
      identifier,
      blueprint: 'service',
      title: 'Test Service',
    });
    createdResources.push(identifier);
    expect(created.identifier).toBe(identifier);
    
    // Read
    const fetched = await client.entities.get(identifier);
    expect(fetched.identifier).toBe(identifier);
    
    // Update
    const updated = await client.entities.update(identifier, {
      title: 'Updated Service',
    });
    expect(updated.title).toBe('Updated Service');
    
    // Delete
    await client.entities.delete(identifier);
    
    // Verify deleted
    await expect(client.entities.get(identifier))
      .rejects
      .toThrow(PortNotFoundError);
  });
});
```

### Running Integration Tests

```bash
# Set credentials
export PORT_CLIENT_ID=xxx
export PORT_CLIENT_SECRET=yyy

# Run integration tests
pnpm test:integration

# Or with inline credentials
PORT_CLIENT_ID=xxx PORT_CLIENT_SECRET=yyy pnpm test:integration
```

## 🛠️ Test Utilities

### Mock Factories

```typescript
// tests/helpers/mocks.ts
import { vi } from 'vitest';
import type { HttpClient } from '../../src/http-client';

export function createMockHttpClient(overrides?: Partial<HttpClient>): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as HttpClient;
}

export function createMockEntity(overrides?: Partial<Entity>): Entity {
  return {
    identifier: 'test-entity',
    blueprint: 'service',
    title: 'Test Entity',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

### Test Fixtures

```typescript
// tests/fixtures/entities.ts
export const validEntity: CreateEntityInput = {
  identifier: 'test-service',
  blueprint: 'service',
  title: 'Test Service',
  properties: {
    stringProps: {
      environment: 'test',
      language: 'typescript',
    },
  },
};

export const invalidEntity: CreateEntityInput = {
  identifier: '',  // Invalid: empty
  blueprint: 'service',
  title: 'Invalid',
};
```

### Custom Matchers

```typescript
// tests/helpers/assertions.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidEntity(received: unknown) {
    const pass = 
      typeof received === 'object' &&
      received !== null &&
      'identifier' in received &&
      'blueprint' in received;

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid entity`
          : `Expected ${received} to be a valid entity`,
    };
  },
});
```

## 📊 Coverage Requirements

### Minimum Coverage

- **Overall**: 90%
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Check Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html

# Check coverage thresholds
pnpm test:coverage --reporter=text
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
```

## 🎯 Testing Checklist

### Before Committing

- [ ] All tests pass (`pnpm test`)
- [ ] Coverage meets thresholds (`pnpm test:coverage`)
- [ ] No type errors (`pnpm type-check`)
- [ ] Tests are isolated (no shared state)
- [ ] Tests are deterministic
- [ ] Error cases are tested
- [ ] Edge cases are covered
- [ ] Mocks are properly reset
- [ ] Integration tests clean up resources
- [ ] No hardcoded credentials

### Test Quality

- [ ] Clear, descriptive test names
- [ ] One assertion per test (when possible)
- [ ] Arrange-Act-Assert pattern
- [ ] No console.log in tests
- [ ] No commented-out tests
- [ ] No flaky tests

## 🚨 Common Patterns

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const result = await resource.asyncMethod();
  expect(result).toBeDefined();
});
```

### Testing Promises

```typescript
it('should resolve promise', async () => {
  await expect(resource.method()).resolves.toBe(expected);
});

it('should reject promise', async () => {
  await expect(resource.method()).rejects.toThrow(Error);
});
```

### Testing Errors

```typescript
it('should throw specific error type', () => {
  expect(() => dangerousFunction()).toThrow(PortValidationError);
});

it('should throw with message', () => {
  expect(() => dangerousFunction()).toThrow('Invalid input');
});
```

### Testing Retries

```typescript
it('should retry on failure', async () => {
  vi.mocked(httpClient.post)
    .mockRejectedValueOnce(new Error('fail 1'))
    .mockRejectedValueOnce(new Error('fail 2'))
    .mockResolvedValue({ success: true });

  const result = await resource.create(input);

  expect(result.success).toBe(true);
  expect(httpClient.post).toHaveBeenCalledTimes(3);
});
```

### Testing Timeouts

```typescript
it('should timeout after specified duration', async () => {
  vi.useFakeTimers();
  
  const promise = resource.slowMethod({ timeout: 1000 });
  
  vi.advanceTimersByTime(1001);
  
  await expect(promise).rejects.toThrow(PortTimeoutError);
  
  vi.useRealTimers();
}, 10000);
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x, 22.x]
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm type-check
      
      - name: Run unit tests
        run: pnpm test:coverage
      
      - name: Run integration tests
        env:
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
        run: pnpm test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Port API Documentation](https://docs.getport.io/)

---

Happy testing! 🧪


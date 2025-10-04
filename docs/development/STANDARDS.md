# Development Standards

Core development standards for the Port SDK.

## TypeScript Standards

### Strict Type Safety

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### No `any` Types

❌ **Never use `any`**:
```typescript
function fetchData(params: any): Promise<any> { }
```

✅ **Use proper types or `unknown`**:
```typescript
function fetchData(params: FetchParams): Promise<ApiResponse<Entity>> { }
```

### Type Guards

```typescript
function isEntity(value: unknown): value is Entity {
  return (
    typeof value === 'object' &&
    value !== null &&
    'identifier' in value &&
    'blueprint' in value
  );
}
```

## Code Style

### Naming Conventions

- `camelCase` for variables and functions
- `PascalCase` for classes and types
- `UPPER_CASE` for constants
- Private properties prefixed with `_` (when needed)

### Formatting

- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multiline
- Semicolons required

## API Client Architecture

### Resource-Based Structure

```typescript
class PortClient {
  public readonly blueprints: BlueprintResource;
  public readonly entities: EntityResource;
  public readonly actions: ActionResource;
  public readonly scorecards: ScorecardResource;
}
```

### Method Naming

Use clear, RESTful method names:
- `create()` - Create new resource
- `get()` - Fetch single resource
- `list()` - Fetch multiple resources
- `update()` - Update existing resource
- `delete()` - Delete resource
- `search()` - Search with filters
- `batch*()` - Batch operations

## Error Handling

### Custom Error Classes

```typescript
export class PortError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'PortError';
  }
}
```

### Error Response Handling

```typescript
async function handleApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));
  
  switch (response.status) {
    case 401:
      throw new PortAuthError(body.message, body);
    case 404:
      throw new PortNotFoundError(resource, identifier, body);
    case 422:
      throw new PortValidationError(body.message, body.errors);
    default:
      throw new PortError(body.message, body.error, response.status, body);
  }
}
```

## Performance

### Request Batching

```typescript
// Instead of multiple requests
const entity1 = await client.entities.create(data1);
const entity2 = await client.entities.create(data2);

// Use batch operations
const entities = await client.entities.batchCreate([data1, data2]);
```

### Caching

```typescript
class BlueprintResource {
  private cache = new Map<string, Blueprint>();

  async get(identifier: string, options?: { skipCache?: boolean }): Promise<Blueprint> {
    if (!options?.skipCache && this.cache.has(identifier)) {
      return this.cache.get(identifier)!;
    }
    // ... fetch and cache
  }
}
```

## Documentation

### JSDoc Comments

```typescript
/**
 * Creates a new entity in Port
 * 
 * @param data - The entity data conforming to its blueprint schema
 * @returns The created entity with server-assigned fields
 * 
 * @throws {PortAuthError} If authentication fails
 * @throws {PortValidationError} If the entity data is invalid
 * 
 * @example
 * ```typescript
 * const entity = await client.entities.create({
 *   identifier: 'my-service',
 *   blueprint: 'service',
 *   title: 'My Service',
 * });
 * ```
 */
async create(data: CreateEntityInput): Promise<Entity> {
  // Implementation
}
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add entity batch operations
fix: resolve token refresh race condition
docs: update README with proxy configuration
test: add integration tests for actions
refactor: simplify error handling logic
security: patch credential exposure in logs
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Test additions/changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `security` - Security improvements
- `chore` - Maintenance tasks

## Pre-Commit Checklist

- [ ] All tests pass
- [ ] Coverage meets thresholds (>90%)
- [ ] Type checking passes
- [ ] No linter errors
- [ ] Documentation updated
- [ ] Security review passed
- [ ] No credentials in code

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Effective TypeScript](https://effectivetypescript.com/)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)


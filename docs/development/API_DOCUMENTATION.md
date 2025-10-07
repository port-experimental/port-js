# API Documentation Generation

This guide explains how to generate and work with the SDK's API documentation using TypeDoc.

## Overview

The Port SDK uses [TypeDoc](https://typedoc.org/) to automatically generate comprehensive API documentation from TypeScript source code and JSDoc comments.

## Quick Start

### Generate Documentation

```bash
# Generate fresh documentation
pnpm docs:generate

# Or manually
pnpm docs:api
```

### View Documentation

Open the generated documentation in your browser:

```bash
# macOS
open docs/api/index.html

# Linux
xdg-open docs/api/index.html

# Windows
start docs/api/index.html
```

## Configuration

TypeDoc configuration is defined in `typedoc.json`:

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "excludePrivate": true,
  "name": "Port SDK for TypeScript/JavaScript"
}
```

### Key Settings

- **Entry Point**: `src/index.ts` - Only exports from this file appear in documentation
- **Output**: `docs/api/` - Generated HTML documentation location
- **Exclude Private**: Internal/private members are hidden from documentation
- **Categories**: Documentation is organized into logical groups

## Writing Documentation

### JSDoc Comments

TypeDoc extracts documentation from JSDoc comments:

```typescript
/**
 * Creates a new entity in Port.
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
 *   properties: {
 *     stringProps: { environment: 'production' }
 *   }
 * });
 * ```
 */
async create(data: CreateEntityInput): Promise<Entity> {
  // Implementation
}
```

### JSDoc Tags

Commonly used tags:

- `@param` - Parameter description
- `@returns` - Return value description
- `@throws` - Error conditions
- `@example` - Code examples
- `@deprecated` - Mark as deprecated
- `@see` - Cross-references
- `@remarks` - Additional notes
- `@category` - Group in documentation

### Example Documentation

**Good Documentation** ✅
```typescript
/**
 * Searches for entities matching the provided query criteria.
 * 
 * This method supports complex queries with multiple rules and combinators.
 * Results are not paginated and limited to 10,000 entities.
 * 
 * @param query - Search query with rules and combinators
 * @returns Array of matching entities
 * 
 * @throws {PortAuthError} If authentication fails
 * @throws {PortValidationError} If query syntax is invalid
 * 
 * @example
 * Basic search:
 * ```typescript
 * const results = await client.entities.search({
 *   combinator: 'and',
 *   rules: [{
 *     property: '$identifier',
 *     operator: '=',
 *     value: 'my-service'
 *   }]
 * });
 * ```
 * 
 * @example
 * Advanced search with multiple conditions:
 * ```typescript
 * const results = await client.entities.search({
 *   combinator: 'and',
 *   rules: [
 *     { property: 'environment', operator: '=', value: 'production' },
 *     { property: 'team', operator: 'in', value: ['backend', 'platform'] }
 *   ]
 * });
 * ```
 * 
 * @see {@link EntitySearchQuery} for query syntax
 * @see {@link SearchOperator} for available operators
 */
async search(query: EntitySearchQuery): Promise<Entity[]> {
  // Implementation
}
```

**Minimal Documentation** ⚠️
```typescript
/**
 * Search entities
 */
async search(query: EntitySearchQuery): Promise<Entity[]> {
  // Not helpful - missing details, examples, error conditions
}
```

## Documentation Structure

Generated documentation includes:

### Main Sections

1. **Classes**
   - `PortClient` - Main SDK client
   - Error classes (`PortError`, `PortAuthError`, etc.)
   - `Logger` - Logging utilities

2. **Interfaces**
   - Configuration interfaces
   - Input/Output types
   - Entity, Blueprint, Action types

3. **Types**
   - Type aliases
   - Union types
   - Utility types

4. **Enums**
   - `LogLevel` - Logging levels
   - Property types
   - Operators

5. **Functions**
   - Utility functions
   - Helper functions

### Navigation

- **Hierarchy** - Class inheritance tree
- **Index** - Alphabetical listing
- **Search** - Full-text search across all documentation

## Best Practices

### 1. Always Document Public APIs

```typescript
// ✅ Good - Public method with documentation
/**
 * Deletes an entity by identifier.
 * @param blueprint - Blueprint identifier
 * @param identifier - Entity identifier
 */
async delete(blueprint: string, identifier: string): Promise<void>

// ❌ Bad - Public method without documentation
async delete(blueprint: string, identifier: string): Promise<void>
```

### 2. Provide Examples

Include practical examples for complex methods:

```typescript
/**
 * @example
 * Basic usage:
 * ```typescript
 * await client.entities.delete('service', 'my-service');
 * ```
 * 
 * @example
 * With error handling:
 * ```typescript
 * try {
 *   await client.entities.delete('service', 'my-service');
 * } catch (error) {
 *   if (error instanceof PortNotFoundError) {
 *     console.log('Entity not found');
 *   }
 * }
 * ```
 */
```

### 3. Document Error Conditions

List all possible errors:

```typescript
/**
 * @throws {PortAuthError} Invalid credentials
 * @throws {PortNotFoundError} Entity not found
 * @throws {PortValidationError} Invalid identifier format
 * @throws {PortNetworkError} Network failure
 */
```

### 4. Use Type Links

Link to related types:

```typescript
/**
 * @param data - Entity data (see {@link CreateEntityInput})
 * @returns Created entity (see {@link Entity})
 * @see {@link UpdateEntityInput} for update operations
 */
```

### 5. Mark Deprecations

```typescript
/**
 * @deprecated Use {@link newMethod} instead. Will be removed in v2.0.0
 */
```

## Troubleshooting

### Warning: Not included in documentation

**Problem**: Resources not exported from `index.ts` show warnings

**Solution**: This is expected. Resources are accessed through `PortClient`:

```typescript
// Resources are not directly exported
// ✅ Correct usage
const client = new PortClient();
client.entities.create(/* ... */);

// ❌ Not supported
import { EntityResource } from '@port-experimental/port-sdk';
```

### Missing Documentation

**Problem**: Types or functions not appearing in documentation

**Solution**: Ensure they're exported from `src/index.ts`:

```typescript
// src/index.ts
export { PortClient } from './client';
export type { Entity, CreateEntityInput } from './types';
```

### Broken Links

**Problem**: `@see` or `{@link}` references not working

**Solution**: Use exact exported names:

```typescript
// ✅ Correct
{@link PortClient}
{@link CreateEntityInput}

// ❌ Wrong
{@link Client}
{@link CreateInput}
```

## CI/CD Integration

### Pre-publish Hook

Documentation generation is NOT included in `prepublishOnly` to keep package size small. API docs are hosted separately.

### GitHub Pages (Optional)

To publish documentation:

```yaml
# .github/workflows/docs.yml
name: Documentation

on:
  push:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm docs:generate
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

## Maintenance

### Updating Documentation

Documentation is regenerated whenever:
1. You run `pnpm docs:generate`
2. JSDoc comments are updated
3. TypeScript types change

### Reviewing Documentation

Before release, review generated docs:

```bash
# Generate fresh docs
pnpm docs:generate

# Open in browser
open docs/api/index.html

# Check for:
# - Missing documentation
# - Broken links
# - Incorrect examples
# - Unclear descriptions
```

## Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [JSDoc Documentation](https://jsdoc.app/)
- [TSDoc Standard](https://tsdoc.org/)

## Summary

- ✅ Run `pnpm docs:generate` to create API documentation
- ✅ Document all public APIs with JSDoc comments
- ✅ Include examples for complex methods
- ✅ Document error conditions with `@throws`
- ✅ Use type links with `{@link}` for better navigation
- ✅ Review generated docs before releases


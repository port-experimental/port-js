# Type Generation Strategy

## Philosophy

The Port SDK uses a **hybrid approach** to type definitions that balances maintainability with API accuracy.

## Strategy

### 1. Hand-Written User-Facing Types

✅ **Primary approach**: Hand-write types that SDK users interact with.

**Rationale**:
- Clean, documented, user-friendly types
- Stable API surface that doesn't change with every OpenAPI update
- Full control over type design and documentation
- Types optimized for TypeScript usage patterns

**Location**: `src/types/{domain}.ts` files

### 2. Auto-Generated Types for Validation

✅ **Secondary use**: Generate types from OpenAPI spec for:
- Internal validation
- Testing/mocking
- Reference documentation
- Change detection

**Location**: `src/types/api.ts` (not imported by SDK code)

### 3. Type Synchronization

When the OpenAPI spec changes:

```bash
# 1. Generate new types
pnpm generate-types

# 2. Run comparison script (detects changes)
pnpm types:check

# 3. Review differences
git diff src/types/api.ts

# 4. Update hand-written types if needed
# Edit src/types/{domain}.ts files

# 5. Run tests to ensure compatibility
pnpm test

# 6. Update version and changelog
```

## Implementation Details

### Hand-Written Types (User-Facing)

```typescript
// src/types/entities.ts
/**
 * Entity in Port
 * User-friendly type optimized for SDK usage
 */
export interface Entity {
  identifier: string;
  blueprint: string;
  title?: string;
  properties?: EntityProperties;
  relations?: EntityRelations;
  // ... clean, documented types
}
```

### Auto-Generated Types (Internal)

```typescript
// src/types/api.ts (generated)
// 22,000+ lines of types
// Used only for:
// - Testing
// - Validation
// - Change detection
```

### Type Guards for Runtime Validation

```typescript
// src/types/guards.ts
/**
 * Validate that API response matches our Entity type
 */
export function isEntity(value: unknown): value is Entity {
  return (
    typeof value === 'object' &&
    value !== null &&
    'identifier' in value &&
    'blueprint' in value
  );
}

/**
 * Transform API response to SDK Entity type
 */
export function transformApiEntity(apiEntity: unknown): Entity {
  if (!isEntity(apiEntity)) {
    throw new PortValidationError('Invalid entity response from API');
  }
  
  return {
    identifier: apiEntity.identifier,
    blueprint: apiEntity.blueprint,
    title: apiEntity.title,
    properties: transformProperties(apiEntity.properties),
    relations: transformRelations(apiEntity.relations),
    // ... safe transformation
  };
}
```

## Advantages

### ✅ Stability
- User-facing API doesn't change with every spec update
- Breaking changes are controlled and intentional
- Semantic versioning is meaningful

### ✅ Maintainability  
- Types are readable and well-documented
- Changes are reviewable in PRs
- Clear ownership of type definitions

### ✅ Flexibility
- Can optimize types for TypeScript patterns
- Can hide API complexity from users
- Can provide better defaults and ergonomics

### ✅ Safety
- Auto-generated types catch API changes
- Test suite validates compatibility
- Runtime validation ensures correctness

## When OpenAPI Spec Changes

### Minor Changes (Fields Added)

```bash
# 1. Regenerate
pnpm generate-types

# 2. Check diff
git diff src/types/api.ts
# See: +  newField?: string;

# 3. Decide: Add to SDK types?
# If yes: Update src/types/entities.ts
# If no: Leave in api.ts only

# 4. Tests still pass
pnpm test
```

### Major Changes (Breaking)

```bash
# 1. Regenerate
pnpm generate-types

# 2. Check diff - significant changes
git diff src/types/api.ts

# 3. Update SDK types
# Edit src/types/entities.ts with new structure

# 4. Update transformers
# Edit transformation functions

# 5. Tests fail - update them
pnpm test

# 6. Bump major version
npm version major

# 7. Document in CHANGELOG
# Add [BREAKING] tag
```

## Alternative: Conditional Type Generation

For maximum automation, we can use a script to extract specific types:

```typescript
// scripts/extract-types.ts
/**
 * Extract only the types we need from api.ts
 * and validate against our hand-written types
 */
import type * as API from '../src/types/api';
import type * as SDK from '../src/types';

// Type-level validation
type EntityCompatible = SDK.Entity extends Partial<API.Entity> ? true : false;
const entityCheck: EntityCompatible = true; // Compile-time check

// Generate comparison report
function compareTypes() {
  // Compare field by field
  // Report differences
  // Suggest updates
}
```

## Recommended Workflow

### Day-to-Day Development

```typescript
// Just use the clean SDK types
import { Entity, CreateEntityInput } from '@port-experimental/port-sdk';

const entity: Entity = {
  identifier: 'my-service',
  blueprint: 'service',
  title: 'My Service',
};
```

### When Updating for New API Version

1. **Update OpenAPI spec**: `curl https://api.getport.io/swagger/json > openapi.json`
2. **Generate types**: `pnpm generate-types`
3. **Check changes**: `git diff src/types/api.ts`
4. **Run tests**: `pnpm test` (will catch breaking changes)
5. **Update SDK types**: Edit hand-written types if needed
6. **Update docs**: Document any new features
7. **Version bump**: Based on semantic versioning rules

## Configuration

```json
// package.json
{
  "scripts": {
    "generate-types": "openapi-typescript openapi.json -o src/types/api.ts",
    "types:check": "tsx scripts/check-types.ts",
    "types:validate": "tsx scripts/validate-types.ts",
    "pretest": "pnpm types:validate"
  }
}
```

## Future Enhancements

### 1. Automated Change Detection

```typescript
// scripts/check-types.ts
// Compares previous api.ts with new one
// Generates migration guide automatically
```

### 2. Type Coverage Reports

```bash
# Report which API types are covered by SDK
pnpm types:coverage
# Output: 85% of API endpoints have SDK types
```

### 3. Compatibility Matrix

```markdown
| SDK Version | Port API Version | Status |
|-------------|------------------|--------|
| 0.1.x       | 1.0.x            | ✅     |
| 0.2.x       | 1.1.x            | ✅     |
```

## Conclusion

This hybrid approach gives you:
- ✅ Clean, maintainable, user-friendly types
- ✅ Automatic detection of API changes
- ✅ Protection against breaking changes
- ✅ Clear upgrade path when API changes
- ✅ No need to deal with 22,000-line files

The `api.ts` file becomes a **reference** and **validation tool**, not the source of truth for SDK types.


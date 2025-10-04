# Updating Types When Port API Changes

This guide explains how to update the SDK when Port.io's API changes.

## Quick Reference

```bash
# 1. Download latest OpenAPI spec
curl https://api.getport.io/swagger/json > openapi.json

# 2. Generate types from spec
pnpm generate-types

# 3. Check what changed
git diff src/types/api.ts

# 4. Validate types are compatible
pnpm types:check

# 5. Run tests
pnpm test

# 6. Update hand-written types if needed (see below)

# 7. Update version and changelog
```

## Step-by-Step Process

### 1. Get the Latest OpenAPI Specification

```bash
# Download from Port.io API
curl https://api.getport.io/swagger/json > openapi.json

# Or use wget
wget https://api.getport.io/swagger/json -O openapi.json
```

### 2. Generate TypeScript Types

```bash
pnpm generate-types
```

This regenerates `src/types/api.ts` from the OpenAPI spec.

### 3. Review Changes

```bash
# See what changed
git diff src/types/api.ts

# Or use a diff tool
code --diff src/types/api.ts
```

**Look for:**
- ✅ New fields (usually safe, additive changes)
- ⚠️  Changed field types (may require SDK updates)
- ❌ Removed fields (breaking changes)
- ❌ Renamed endpoints (breaking changes)

### 4. Classify the Change

#### Minor Changes (Safe, Additive)

New optional fields, new endpoints, new enum values.

**Example**:
```typescript
// Before
export interface Entity {
  identifier: string;
  blueprint: string;
  title?: string;
}

// After (new optional field)
export interface Entity {
  identifier: string;
  blueprint: string;
  title?: string;
  description?: string; // ← New field
}
```

**Action**: Usually no SDK changes needed. Consider adding to SDK types.

#### Major Changes (Breaking)

Field removals, type changes, required field additions.

**Example**:
```typescript
// Before
export interface Entity {
  identifier: string;
  properties?: Record<string, unknown>;
}

// After (breaking change)
export interface Entity {
  identifier: string;
  properties: {  // ← Now required with specific structure
    stringProps?: Record<string, string>;
    numberProps?: Record<string, number>;
  };
}
```

**Action**: Must update SDK types and bump major version.

### 5. Update SDK Types

#### When to Update

Update hand-written types (`src/types/*.ts`) when:
- ✅ New fields that users should know about
- ✅ Changed field types
- ✅ New functionality in the API
- ✅ Breaking changes (required)

Don't update when:
- ❌ Internal API fields not exposed to SDK users
- ❌ Deprecated fields being removed (if SDK never exposed them)
- ❌ Minor additions that don't affect SDK usage

#### How to Update

**Example: Adding a New Field**

```typescript
// 1. Check the change in api.ts
git diff src/types/api.ts
// +  newField?: string;

// 2. Update hand-written type in entities.ts
export interface Entity {
  identifier: string;
  blueprint: string;
  title?: string;
  description?: string;  // ← Add new field
  // ... existing fields
}

// 3. Update CreateEntityInput too
export interface CreateEntityInput {
  identifier: string;
  blueprint: string;
  title?: string;
  description?: string;  // ← Add here too
  // ... existing fields
}
```

**Example: Handling Breaking Change**

```typescript
// 1. API changed properties structure
// Old: properties?: Record<string, unknown>
// New: properties?: { stringProps?: Record<string, string>, ... }

// 2. Update entity type
export interface EntityProperties {
  stringProps?: Record<string, string>;
  numberProps?: Record<string, number>;
  booleanProps?: Record<string, boolean>;
  arrayProps?: Record<string, unknown[]>;
}

export interface Entity {
  identifier: string;
  blueprint: string;
  properties?: EntityProperties;  // ← Updated type
  // ... existing fields
}

// 3. Update HTTP client to transform responses
// src/http-client.ts or src/resources/entities.ts
function transformApiResponse(apiEntity: any): Entity {
  return {
    identifier: apiEntity.identifier,
    blueprint: apiEntity.blueprint,
    properties: transformProperties(apiEntity.properties),
    // ...
  };
}
```

### 6. Run Type Validation

```bash
# Check that everything compiles
pnpm type-check

# Run type compatibility check
pnpm types:check

# Run full test suite
pnpm test
```

### 7. Update Tests

If types changed, update tests:

```typescript
// tests/unit/entities.test.ts
describe('Entity', () => {
  it('should handle new description field', () => {
    const entity: Entity = {
      identifier: 'test',
      blueprint: 'service',
      description: 'Test description',  // ← New field
    };
    
    expect(entity.description).toBe('Test description');
  });
});
```

### 8. Update Documentation

Update relevant documentation:

```bash
# README.md - if user-facing changes
# CHANGELOG.md - always update
# src/types/README.md - if type organization changed
```

**CHANGELOG.md example**:
```markdown
## [0.2.0] - 2025-01-15

### Added
- Support for entity descriptions
- New `description` field on Entity and CreateEntityInput types

### Changed
- [BREAKING] Entity properties structure updated to match new API format
```

### 9. Version Bump

Follow semantic versioning:

```bash
# Patch (0.1.0 → 0.1.1) - Bug fixes, no breaking changes
npm version patch

# Minor (0.1.0 → 0.2.0) - New features, backward compatible
npm version minor

# Major (0.1.0 → 1.0.0) - Breaking changes
npm version major
```

## Real-World Examples

### Example 1: New Optional Field

**API Change**:
```diff
export interface Entity {
  identifier: string;
  blueprint: string;
+ tags?: string[];
}
```

**SDK Update**:
```typescript
// 1. Update src/types/entities.ts
export interface Entity {
  identifier: string;
  blueprint: string;
  tags?: string[];  // ← Add field
}

export interface CreateEntityInput {
  identifier: string;
  blueprint: string;
  tags?: string[];  // ← Add to input type too
}

// 2. Update CHANGELOG.md
### Added
- Support for entity tags

// 3. Version bump
npm version minor  // 0.1.0 → 0.2.0
```

### Example 2: Breaking Change

**API Change**:
```diff
export interface Entity {
  identifier: string;
- createdAt?: string;
+ createdAt: Date;  // Now required and Date type
}
```

**SDK Update**:
```typescript
// 1. Update src/types/entities.ts
export interface Entity {
  identifier: string;
  createdAt: Date;  // ← Make required, use Date
}

// 2. Add transformer in http-client
function transformEntity(api: ApiEntity): Entity {
  return {
    ...api,
    createdAt: new Date(api.createdAt),  // ← Parse date string
  };
}

// 3. Update tests
it('should parse createdAt as Date', () => {
  const entity = transformEntity(apiResponse);
  expect(entity.createdAt).toBeInstanceOf(Date);
});

// 4. Update CHANGELOG.md
### Changed
- [BREAKING] `createdAt` is now required and typed as Date

### Migration Guide
```typescript
// Before
if (entity.createdAt) {
  const date = new Date(entity.createdAt);
}

// After
const date = entity.createdAt;  // Already a Date
```

// 5. Version bump
npm version major  // 0.1.0 → 1.0.0
```

## Automation Ideas

### Git Hook for Type Checks

```bash
# .husky/pre-push
#!/bin/sh
pnpm types:check || {
  echo "⚠️  Type compatibility check failed!"
  echo "Run: pnpm types:check for details"
  exit 1
}
```

### CI/CD Integration

```yaml
# .github/workflows/types.yml
name: Type Compatibility

on:
  pull_request:
    paths:
      - 'src/types/**'
      - 'openapi.json'

jobs:
  check-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Check type compatibility
        run: |
          pnpm install
          pnpm types:check
          pnpm test
```

## Troubleshooting

### Issue: Types Don't Compile After Regeneration

```bash
# Clean build artifacts
rm -rf dist node_modules/.cache

# Reinstall dependencies
pnpm install

# Try again
pnpm type-check
```

### Issue: Hand-Written Types Don't Match API

This is expected! Hand-written types are optimized for SDK users, not exact API replicas.

Use transformers to bridge the gap:
```typescript
function apiToSdk(apiEntity: ApiEntity): Entity {
  return {
    // Transform API structure to SDK structure
  };
}
```

### Issue: Breaking Changes in Patch Version

Port.io may occasionally make breaking changes. Handle gracefully:

1. Pin SDK to specific Port API version
2. Add version detection in SDK
3. Provide migration guide
4. Consider supporting multiple API versions

## Best Practices

1. ✅ **Always test after regenerating types**
2. ✅ **Review git diff carefully**
3. ✅ **Update CHANGELOG.md**
4. ✅ **Follow semantic versioning strictly**
5. ✅ **Provide migration guides for breaking changes**
6. ✅ **Keep hand-written types clean and user-friendly**
7. ✅ **Use transformers for complex API responses**

## Questions?

See also:
- [Type Generation Strategy](./TYPE_GENERATION_STRATEGY.md)
- [Types README](../src/types/README.md)
- [Contributing Guide](../CONTRIBUTING.md)


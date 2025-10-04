# Type Generation Guide

This guide explains how TypeScript types are generated from the Port API OpenAPI specification and how to update them.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Updating Types](#updating-types)
- [Type Organization](#type-organization)
- [Troubleshooting](#troubleshooting)

## Overview

The Port SDK uses **auto-generated TypeScript types** from Port's OpenAPI specification. This ensures:

- ✅ **Type Safety**: All API types are accurate and up-to-date
- ✅ **Auto-Complete**: Full IDE support with IntelliSense
- ✅ **Compile-Time Checks**: Catch errors before runtime
- ✅ **API Compatibility**: Types match the actual API

## Quick Start

### Download Latest OpenAPI Spec

```bash
pnpm types:download
```

This downloads the latest OpenAPI specification from Port API:
```bash
curl -o openapi.json https://api.port.io/static/openapi.json
```

### Generate TypeScript Types

```bash
pnpm types:generate
```

This generates TypeScript types from the OpenAPI spec:
```bash
openapi-typescript openapi.json -o src/types/api.ts
```

### Update Both at Once

```bash
pnpm types:update
```

This runs both commands sequentially:
1. Downloads latest OpenAPI spec
2. Generates TypeScript types

## How It Works

### 1. OpenAPI Specification

Port.io provides an OpenAPI specification that describes the entire API:

- **Location**: `https://api.port.io/static/openapi.json`
- **Format**: OpenAPI 3.0 JSON
- **Size**: ~22,000 lines (comprehensive!)
- **Contents**: All endpoints, schemas, parameters, responses

### 2. Type Generation Tool

We use [`openapi-typescript`](https://www.npmjs.com/package/openapi-typescript) to convert the OpenAPI spec to TypeScript:

```bash
# Install the tool
pnpm add -D openapi-typescript

# Generate types
openapi-typescript openapi.json -o src/types/api.ts
```

### 3. Generated Output

The tool generates `src/types/api.ts` containing:

```typescript
// Auto-generated TypeScript definitions
export interface paths {
  '/v1/blueprints': {
    get: operations['get-blueprints'];
    post: operations['create-blueprint'];
  };
  // ... all API endpoints
}

export interface components {
  schemas: {
    Blueprint: { /* ... */ };
    Entity: { /* ... */ };
    // ... all API schemas
  };
}

export interface operations {
  'get-blueprints': { /* ... */ };
  'create-blueprint': { /* ... */ };
  // ... all API operations
}
```

### 4. Type Organization

While `api.ts` is auto-generated, we organize types for better usability:

```
src/types/
├── api.ts           # Auto-generated from OpenAPI (DO NOT EDIT)
├── index.ts         # Public exports
├── common.ts        # Common types (PaginatedResponse, etc.)
├── blueprints.ts    # Blueprint-specific types
├── entities.ts      # Entity-specific types
├── actions.ts       # Action-specific types
└── scorecards.ts    # Scorecard-specific types
```

**Key Files:**

- **`api.ts`**: Raw generated types (large, comprehensive)
- **`index.ts`**: Organized exports for SDK users
- **`common.ts`**: Shared types used across the SDK
- **`entities.ts`, etc.**: Domain-specific type helpers

## Updating Types

### When to Update

Update types when:

- 🆕 Port API adds new features
- 🔧 Port API changes existing endpoints
- 🐛 Type definitions don't match actual API behavior
- 📅 Regular maintenance (monthly recommended)

### Update Process

#### Step 1: Download Latest Spec

```bash
pnpm types:download
```

This downloads `openapi.json` to the project root.

#### Step 2: Review Changes

```bash
# Check what changed
git diff openapi.json
```

Look for:
- New endpoints or operations
- Changed parameters or responses
- Deprecated features
- Breaking changes

#### Step 3: Generate New Types

```bash
pnpm types:generate
```

This updates `src/types/api.ts`.

#### Step 4: Verify Generated Types

```bash
# Type check the SDK
pnpm type-check

# Run tests
pnpm test
```

#### Step 5: Update SDK Code (if needed)

If Port API has breaking changes, update SDK code:

```typescript
// Example: If a property name changed
// OLD:
entity.blueprintId

// NEW:
entity.blueprint
```

#### Step 6: Update CHANGELOG

Document the changes:

```markdown
## [Unreleased]

### Changed
- Updated types to match Port API v2.5.0
- `Blueprint.id` renamed to `Blueprint.identifier`

### Added
- New `Scorecard` types
- Support for `Action` webhooks
```

#### Step 7: Commit Changes

```bash
git add openapi.json src/types/api.ts
git commit -m "chore: update types from Port API OpenAPI spec"
```

### Automated Updates (Future)

We plan to automate type updates using GitHub Actions:

```yaml
name: Update Types

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:      # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm types:update
      - uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update API types'
```

## Type Organization

### Auto-Generated Types (`api.ts`)

This file is **100% auto-generated**. Never edit manually!

```typescript
// ❌ DON'T DO THIS
// src/types/api.ts
export interface Blueprint {
  id: string;  // Manual edit
}

// ✅ DO THIS INSTEAD
// src/types/blueprints.ts
import { components } from './api';

export type Blueprint = components['schemas']['Blueprint'];
```

### Re-Exported Types

We re-export types for easier consumption:

```typescript
// src/types/index.ts
export type {
  Blueprint,
  Entity,
  Action,
  Scorecard,
} from './blueprints'; // Not from ./api.ts

// Usage in SDK code
import { Blueprint } from '../types';
// Instead of:
// import { components } from '../types/api';
// type Blueprint = components['schemas']['Blueprint'];
```

### Custom Types

For SDK-specific types, create them in appropriate files:

```typescript
// src/types/common.ts
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

export interface CreateEntityInput {
  identifier: string;
  blueprint: string;
  title?: string;
  properties?: EntityProperties;
  relations?: EntityRelations;
}
```

## .gitattributes

We mark `api.ts` as generated for better diffs:

```bash
# .gitattributes
src/types/api.ts linguist-generated=true
```

This helps GitHub:
- Collapse diffs by default
- Not count it in language statistics
- Show "Generated" badge in PR

## Type Validation

### Compile-Time Validation

TypeScript checks types during compilation:

```bash
pnpm type-check
```

### Runtime Validation

For critical operations, validate at runtime:

```typescript
function validateBlueprint(data: unknown): Blueprint {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid blueprint data');
  }
  
  const bp = data as Blueprint;
  
  if (!bp.identifier || typeof bp.identifier !== 'string') {
    throw new Error('Blueprint must have identifier');
  }
  
  return bp;
}
```

### Test Validation

Tests verify types match actual API:

```typescript
// tests/integration/types.test.ts
it('should match actual API response', async () => {
  const response = await client.blueprints.get('service');
  
  // TypeScript ensures response matches Blueprint type
  expect(response.identifier).toBeDefined();
  expect(response.schema).toBeDefined();
});
```

## Troubleshooting

### "Cannot download openapi.json"

**Problem**: `pnpm types:download` fails

**Solutions**:
```bash
# 1. Check network connectivity
curl https://api.port.io/static/openapi.json

# 2. Use alternative download method
wget https://api.port.io/static/openapi.json

# 3. Download manually and save as openapi.json
open https://api.port.io/static/openapi.json
```

### "Type generation fails"

**Problem**: `pnpm types:generate` produces errors

**Solutions**:
```bash
# 1. Verify openapi.json is valid JSON
cat openapi.json | jq . > /dev/null

# 2. Check openapi-typescript version
pnpm list openapi-typescript

# 3. Update openapi-typescript
pnpm add -D openapi-typescript@latest

# 4. Try with verbose output
pnpm openapi-typescript openapi.json -o src/types/api.ts --help
```

### "Types don't match API"

**Problem**: Generated types don't match actual API responses

**Solutions**:

1. **Verify OpenAPI spec is latest**:
   ```bash
   pnpm types:download
   ```

2. **Check API region**:
   ```typescript
   // EU uses: https://api.port.io
   // US uses: https://api.us.port.io
   ```

3. **Report to Port**:
   - OpenAPI spec might be outdated
   - Contact Port support with details

### "Type is too complex"

**Problem**: TypeScript complains type is too complex

**Solutions**:

```typescript
// Option 1: Simplify the type
type SimpleBlueprint = Pick<Blueprint, 'identifier' | 'title' | 'schema'>;

// Option 2: Use type assertion
const blueprint = response as Blueprint;

// Option 3: Increase TypeScript limits (tsconfig.json)
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### "api.ts conflicts in Git"

**Problem**: Merge conflicts in auto-generated file

**Solutions**:

```bash
# Always regenerate, never manually resolve
git checkout --theirs src/types/api.ts
pnpm types:update
git add src/types/api.ts
```

## Best Practices

### ✅ DO

- **Download types regularly**: At least monthly
- **Regenerate, don't edit**: Always use `types:generate`
- **Test after updating**: Run `pnpm test` after updates
- **Document changes**: Note API changes in CHANGELOG
- **Use re-exports**: Import from organized files, not `api.ts`

### ❌ DON'T

- **Manually edit api.ts**: It will be overwritten
- **Commit without testing**: Always run tests first
- **Ignore type errors**: They indicate real issues
- **Skip documentation**: Update docs when types change

## Advanced Topics

### Custom Type Transformations

Sometimes you need to transform generated types:

```typescript
// src/types/entities.ts
import { components } from './api';

// Generated type
type ApiEntity = components['schemas']['Entity'];

// Transform for SDK use
export interface Entity extends Omit<ApiEntity, 'createdAt' | 'updatedAt'> {
  createdAt: Date;  // Transform string to Date
  updatedAt: Date;
}
```

### Type Guards

Create type guards for runtime checking:

```typescript
export function isBlueprint(value: unknown): value is Blueprint {
  return (
    typeof value === 'object' &&
    value !== null &&
    'identifier' in value &&
    'schema' in value
  );
}

// Usage
if (isBlueprint(data)) {
  // TypeScript knows data is Blueprint here
  console.log(data.identifier);
}
```

### Branded Types

Prevent mixing similar types:

```typescript
type BlueprintId = string & { __brand: 'BlueprintId' };
type EntityId = string & { __brand: 'EntityId' };

function getBlueprint(id: BlueprintId) { /* ... */ }

const blueprintId = 'service' as BlueprintId;
const entityId = 'my-service' as EntityId;

getBlueprint(blueprintId);  // ✅ OK
getBlueprint(entityId);     // ❌ Type error!
```

## Resources

### Tools

- [openapi-typescript](https://www.npmjs.com/package/openapi-typescript) - Type generator
- [OpenAPI Spec](https://api.port.io/static/openapi.json) - Port API spec
- [TypeScript](https://www.typescriptlang.org/) - TypeScript documentation

### Port Resources

- [Port API Docs](https://docs.port.io/api-reference) - API documentation
- [Port OpenAPI](https://api.port.io/docs) - Interactive API explorer
- [Port Support](mailto:support@getport.io) - Technical support

### Related Documentation

- [Type Generation Strategy](../TYPE_GENERATION_STRATEGY.md) - Detailed strategy
- [Updating Types Guide](../UPDATING_TYPES.md) - Step-by-step update guide
- [SDK Development Standards](../../.cursor/rules/sdk-development-standards.mdc) - Coding standards

## FAQ

**Q: How often should I update types?**  
A: Monthly, or when you notice API changes. Subscribe to Port's changelog.

**Q: Can I use types without the SDK?**  
A: Yes! Import types directly: `import { Blueprint } from '@port-labs/port-sdk/types'`

**Q: What if the generated type is wrong?**  
A: Report it to Port support. The OpenAPI spec needs updating.

**Q: Can I add custom properties to types?**  
A: Extend types in separate files, don't modify `api.ts`.

**Q: How do I handle breaking changes?**  
A: Update SDK code, bump major version, document in CHANGELOG.

---

**Last Updated:** October 4, 2025  
**SDK Version:** 0.1.0  
**Port API Version:** Latest


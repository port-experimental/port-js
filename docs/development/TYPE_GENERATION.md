# Type Generation from OpenAPI

This document explains how the SDK generates TypeScript types from Port.io's OpenAPI specification.

## Overview

The SDK uses [`openapi-typescript`](https://github.com/drwpow/openapi-typescript) to automatically generate TypeScript types from Port's OpenAPI spec, ensuring type safety and accuracy.

## Commands

### Update Types (Recommended)

Downloads the latest OpenAPI spec and regenerates types in one command:

```bash
pnpm types:update
```

### Manual Steps

If you want more control:

```bash
# 1. Download the OpenAPI specification
pnpm types:download

# 2. Generate TypeScript types
pnpm types:generate
```

## OpenAPI Source

**Endpoint:** `https://api.port.io/swagger/json`

This endpoint provides the complete OpenAPI 3.1.0 specification for Port's API, including:
- All endpoints and operations
- Request/response schemas
- Error responses
- Authentication requirements

## Generated Files

### `openapi.json` (941KB)
- Raw OpenAPI specification
- Auto-downloaded from Port API
- **Not committed to git** (in `.gitignore`)
- Should be regenerated regularly

### `src/types/api.ts` (1.1MB)
- Auto-generated TypeScript types
- **Committed to git** for developer convenience
- Contains `paths`, `components`, `operations` types
- Used internally by SDK resources

## Usage in SDK

The generated types are used internally to ensure type safety:

```typescript
import type { paths } from './types/api';

// Extract specific endpoint types
type GetBlueprintResponse = paths['/v1/blueprints/{blueprint_identifier}']['get']['responses']['200']['content']['application/json'];
```

## When to Regenerate Types

### Required
- ✅ Before major releases
- ✅ When implementing new API endpoints
- ✅ When Port.io announces API changes

### Optional
- 🔄 Weekly (via automated workflow)
- 🔄 When you notice type mismatches
- 🔄 During development of new features

## Automated Updates

The repository has a GitHub Actions workflow that:
1. Downloads the latest OpenAPI spec daily
2. Generates new types
3. Creates a PR if changes are detected
4. See [AUTOMATED_WORKFLOWS.md](./AUTOMATED_WORKFLOWS.md)

## Troubleshooting

### Download Fails

**Problem:** `curl` returns 404 or empty file

**Solution:** Verify the endpoint is accessible:
```bash
curl -I https://api.port.io/swagger/json
```

### Generation Fails

**Problem:** `openapi-typescript` throws an error

**Solutions:**
1. Check if `openapi.json` is valid JSON:
   ```bash
   cat openapi.json | jq . > /dev/null
   ```

2. Check openapi-typescript version:
   ```bash
   pnpm list openapi-typescript
   ```

3. Clear cache and retry:
   ```bash
   rm openapi.json src/types/api.ts
   pnpm types:update
   ```

### Type Mismatches

**Problem:** Generated types don't match actual API responses

**Possible causes:**
1. **Outdated spec** - Regenerate types with `pnpm types:update`
2. **API changed** - Port may have updated their API without updating the spec
3. **Beta features** - Some endpoints may not be in the public spec yet

**Solution:** Report discrepancies to Port.io support or create an issue.

## Manual Type Definitions

Some types are manually defined in `src/types/` because:
- They're more ergonomic for SDK users
- They transform API responses (e.g., dates as Date objects)
- They combine multiple API types

Manual types should:
- ✅ Extend or transform generated types
- ✅ Be documented with JSDoc
- ✅ Have examples showing usage
- ❌ Never contradict generated types

## CI/CD Integration

### Pull Request Checks

The CI runs `pnpm types:check` which verifies:
- Generated types are up-to-date
- No TypeScript compilation errors
- All SDK resources use correct types

### Pre-Release Checklist

Before releasing a new version:
- [ ] Run `pnpm types:update`
- [ ] Commit any changes to `src/types/api.ts`
- [ ] Run `pnpm type-check` to verify
- [ ] Test smoke tests: `pnpm smoke`

## Resources

- [Port.io API Docs](https://docs.port.io/api-reference/)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [openapi-typescript GitHub](https://github.com/drwpow/openapi-typescript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated:** October 6, 2025  
**OpenAPI Version:** 3.1.0  
**SDK Version:** 0.1.0+

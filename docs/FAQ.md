# Frequently Asked Questions

## Q: The types/api.ts file is 22,000+ lines. How do I manage this?

**A: You don't need to!** The `api.ts` file is auto-generated and serves as a reference. Here's the strategy:

### What You Should Do

1. **Import from organized files**, not `api.ts`:
   ```typescript
   // ✅ Good
   import { Entity } from '@port-labs/port-sdk';
   
   // ❌ Don't do this
   import { Entity } from '@port-labs/port-sdk/types/api';
   ```

2. **Edit hand-written types** in `src/types/`:
   - `common.ts` - ~60 lines
   - `entities.ts` - ~100 lines
   - `blueprints.ts` - ~160 lines
   - `actions.ts` - ~150 lines
   - `scorecards.ts` - ~80 lines

3. **Never edit `api.ts`** - it's auto-generated and will be overwritten

### Purpose of api.ts

- ✅ Reference for API structure
- ✅ Change detection when API updates
- ✅ Internal validation
- ❌ NOT for direct use by SDK code
- ❌ NOT for editing manually

## Q: When OpenAPI spec changes, will everything work easily?

**A: Yes! Here's the process:**

### Automatic Workflow

```bash
# Step 1: Download new spec
curl https://api.getport.io/swagger/json > openapi.json

# Step 2: Regenerate types
pnpm generate-types

# Step 3: Check what changed
git diff src/types/api.ts

# Step 4: Validate (automatic)
pnpm types:check

# Step 5: Run tests (catches breaking changes)
pnpm test
```

### What Happens Automatically

1. ✅ **Type generation**: `api.ts` is regenerated
2. ✅ **Compatibility check**: Script compares old vs new
3. ✅ **Compilation check**: TypeScript validates everything
4. ✅ **Test validation**: Tests catch runtime issues

### What You Need to Do Manually

Only if there are breaking changes or new features you want to expose:

1. Update hand-written types in `src/types/*.ts` (small, manageable files)
2. Update CHANGELOG.md
3. Bump version

### Example: Minor API Change

```bash
# Before
$ pnpm generate-types
✓ Generated types successfully

$ pnpm types:check
✓ api.ts found (5.2 MB, 2 days old)
✓ common.ts found
✓ entities.ts found
✓ All type checks passed!

$ pnpm test
✓ All tests pass

# No changes needed! API change was additive.
```

### Example: Major API Change

```bash
$ pnpm generate-types
✓ Generated types successfully

$ pnpm types:check
✓ api.ts found (5.3 MB, 0 days old)
⚠️ Significant changes detected in api.ts

$ pnpm test
✗ 3 tests failing
  - Entity creation test: properties structure changed
  
# Action needed:
# 1. Update src/types/entities.ts with new structure
# 2. Update transformation logic
# 3. Fix tests
# 4. Bump major version
```

## Q: How do I know what changed in the API?

**A: Multiple ways:**

### 1. Git Diff

```bash
git diff src/types/api.ts
```

Shows exact lines added/removed/changed.

### 2. Type Check Script

```bash
pnpm types:check
```

Validates compatibility and shows warnings/errors.

### 3. Test Suite

```bash
pnpm test
```

Failing tests indicate breaking changes.

### 4. Documentation

Check Port.io's [API changelog](https://docs.getport.io/api-changelog).

## Q: Can I ignore the api.ts file in Git?

**A: No, but you can mark it as generated:**

We've added `.gitattributes`:
```
src/types/api.ts linguist-generated=true
```

This tells GitHub to:
- Collapse it in PR diffs
- Exclude from language statistics
- Mark as generated code

You still commit it so everyone has the same types.

## Q: What if my hand-written types drift from api.ts?

**A: That's intentional and okay!** Here's why:

### By Design

- **api.ts**: Raw API structure (verbose, complex)
- **SDK types**: User-friendly, optimized for TypeScript

### Example

```typescript
// api.ts (auto-generated, verbose)
export interface ApiEntity {
  identifier: string;
  blueprint: string;
  properties: {
    [key: string]: string | number | boolean | object;
  };
  createdAt: string;  // ISO string
}

// entities.ts (hand-written, clean)
export interface Entity {
  identifier: string;
  blueprint: string;
  properties?: EntityProperties;  // Structured
  createdAt?: Date;  // Proper Date object
}
```

### Bridging the Gap

Use transformers:
```typescript
function transformApiEntity(api: ApiEntity): Entity {
  return {
    identifier: api.identifier,
    blueprint: api.blueprint,
    properties: parseProperties(api.properties),
    createdAt: new Date(api.createdAt),
  };
}
```

## Q: How often should I update types?

**A: Depends on your needs:**

### Conservative (Recommended)

- Update when you need new API features
- Update quarterly for maintenance
- Update when Port.io announces breaking changes

### Aggressive

- Update monthly
- Always use latest API version
- Higher maintenance effort

### On-Demand

- Only update when needed
- Pin to specific Port API version
- Most stable, least maintenance

## Q: Will this scale as the API grows?

**A: Yes!** The strategy is designed for growth:

### Scalability Features

1. **Domain-organized types**: Each domain in its own file
2. **Auto-generated reference**: api.ts can grow without impacting usability
3. **Validation scripts**: Catch issues automatically
4. **Clear separation**: User-facing vs internal types
5. **Documentation**: Guides for every scenario

### As API Grows

- ✅ api.ts gets larger (no problem, it's auto-generated)
- ✅ Hand-written files stay small and focused
- ✅ SDK users never see the complexity
- ✅ Type checking catches issues automatically

## Summary

### ✅ Easy Type Management

1. **You manage**: Small, organized files (~60-160 lines each)
2. **System manages**: Large generated file (22,000 lines)
3. **Automatic validation**: Catches issues before deployment
4. **Clear process**: Step-by-step guides for updates

### ✅ When API Changes

1. Run `pnpm generate-types` (30 seconds)
2. Run `pnpm types:check` (5 seconds)
3. Review changes if any (5-30 minutes depending on change)
4. Done!

### ✅ Best of Both Worlds

- **Auto-generation**: Never manually maintain 22,000 lines
- **Hand-crafted types**: Beautiful, documented user experience
- **Validation**: Automatic compatibility checking
- **Flexibility**: Optimize types for TypeScript patterns

---

**Still have questions?** Open an issue on GitHub or check:
- [Type Generation Strategy](./TYPE_GENERATION_STRATEGY.md)
- [Updating Types Guide](./UPDATING_TYPES.md)
- [Types README](../src/types/README.md)


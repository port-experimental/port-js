# TypeScript Validation Rule

## Rule: Always Check TypeScript Errors on Save

**Priority: CRITICAL** 🔴

### Overview

Every time new code is written, modified, or a file is saved, TypeScript type checking MUST be performed to catch type errors immediately.

---

## Mandatory Workflow

### 1. After Writing/Editing Code

When you create or modify TypeScript files, **ALWAYS** run type checking:

```bash
# Check specific file
pnpm tsc --noEmit path/to/file.ts

# Check entire project
pnpm type-check

# Or use the shorter alias
pnpm tsc --noEmit
```

### 2. Before Committing

**NEVER** commit code with TypeScript errors. Always verify:

```bash
# Full type check
pnpm type-check

# If errors exist, fix them before proceeding
```

### 3. When Adding New Features

For new files or major changes:

1. ✅ Write the code
2. ✅ Run `pnpm type-check`
3. ✅ Fix all type errors
4. ✅ Run tests
5. ✅ Commit

---

## Common Type Errors to Watch For

### Missing Properties in Interfaces

```typescript
// ❌ BAD - Missing required property
interface CreateInput {
  identifier: string;
  title: string;
}

const data = { identifier: 'test' }; // Type error!

// ✅ GOOD - All properties provided
const data = { identifier: 'test', title: 'Test' };
```

### Mismatched Types

```typescript
// ❌ BAD - Type mismatch
interface User {
  age: number;
}

const user: User = { age: '25' }; // Type error!

// ✅ GOOD - Correct type
const user: User = { age: 25 };
```

### Optional vs Required Properties

```typescript
// ❌ BAD - url is required in UpdateInput
interface UpdateInput {
  url: string; // Required
}

client.update(id, { title: 'New' }); // Type error - url missing!

// ✅ GOOD - Make it optional or provide it
interface UpdateInput {
  url?: string; // Optional
}

client.update(id, { title: 'New', url: 'https://...' });
```

### Any Type Usage

```typescript
// ❌ BAD - Using 'any' bypasses type safety
function process(data: any) {
  return data.someProperty; // No type checking!
}

// ✅ GOOD - Use proper types
interface Data {
  someProperty: string;
}

function process(data: Data) {
  return data.someProperty; // Type safe!
}
```

---

## Type Safety Checklist

Before considering code "done":

- [ ] ✅ `pnpm type-check` passes with 0 errors
- [ ] ✅ No `any` types (use `unknown` if necessary)
- [ ] ✅ All interface properties properly defined
- [ ] ✅ Function parameters have explicit types
- [ ] ✅ Return types are specified (or inferred correctly)
- [ ] ✅ No `@ts-ignore` comments (fix the actual issue)
- [ ] ✅ No `as any` type assertions
- [ ] ✅ Strict mode enabled in tsconfig.json

---

## Automated Checks

### Pre-commit Hook (Recommended)

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Type check before commit
pnpm type-check || {
  echo "❌ TypeScript errors found! Fix them before committing."
  exit 1
}
```

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "typescript.validate.enable": true,
  "javascript.validate.enable": true
}
```

### Watch Mode (Development)

Run in a separate terminal during development:

```bash
# Watch for type errors in real-time
pnpm tsc --noEmit --watch
```

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: TypeScript Type Check
  run: pnpm type-check
  
- name: Fail on Type Errors
  if: failure()
  run: |
    echo "❌ TypeScript type checking failed"
    exit 1
```

---

## When Type Errors Occur

### Step-by-Step Resolution

1. **Read the Error Message**
   ```
   error TS2339: Property 'url' does not exist on type 'UpdateWebhookInput'.
   ```

2. **Locate the Issue**
   - File: `smoke-tests/12-webhooks-crud.ts`
   - Line: 84
   - Problem: Missing `url` property in type definition

3. **Fix the Root Cause**
   - Don't add `@ts-ignore`
   - Don't use `as any`
   - Fix the type definition or code

4. **Verify the Fix**
   ```bash
   pnpm type-check
   ```

5. **Test the Change**
   ```bash
   pnpm test
   ```

---

## Type Definition Updates

When adding properties to interfaces:

### Before
```typescript
export interface UpdateInput {
  title?: string;
  description?: string;
}
```

### After
```typescript
export interface UpdateInput {
  title?: string;
  description?: string;
  url?: string;  // ✅ Add new property
}
```

### Always Update
1. The main interface
2. Create input interface (if applicable)
3. Update input interface (if applicable)
4. Any related types
5. Tests that use these types

---

## Exception Handling

### The ONLY Acceptable Use of Type Assertions

```typescript
// ✅ ACCEPTABLE - When you have more information than TypeScript
const element = document.getElementById('root') as HTMLDivElement;

// ✅ ACCEPTABLE - Parsing external data with validation
const data = JSON.parse(response) as MyInterface;
if (!isValidData(data)) {
  throw new Error('Invalid data');
}
```

### NEVER Acceptable

```typescript
// ❌ NEVER - Bypassing type safety
const data: any = { ... };
const result = (data as MyType).someMethod();

// ❌ NEVER - Ignoring errors
// @ts-ignore
const broken = someUntypedFunction();
```

---

## Benefits of Strict Type Checking

1. ✅ **Catch Errors Early** - Find bugs at compile time, not runtime
2. ✅ **Better IDE Support** - Autocomplete and IntelliSense
3. ✅ **Self-Documenting** - Types serve as documentation
4. ✅ **Refactoring Safety** - Compiler catches breaking changes
5. ✅ **Reduced Testing Burden** - Fewer runtime type errors
6. ✅ **Team Confidence** - Everyone knows the contracts

---

## Quick Reference Commands

```bash
# Check all files
pnpm type-check

# Check specific file
pnpm tsc --noEmit src/path/to/file.ts

# Watch mode (continuous)
pnpm tsc --noEmit --watch

# Check and show detailed errors
pnpm tsc --noEmit --pretty

# Generate type declaration files
pnpm tsc --declaration --emitDeclarationOnly
```

---

## Summary

**Golden Rule:** If TypeScript reports an error, fix it. Don't ignore it, don't suppress it, don't work around it. Fix the root cause.

### Workflow Reminder

1. Write code → 2. Save file → 3. Run `pnpm type-check` → 4. Fix errors → 5. Repeat until clean

---

## Enforcement

- ❌ Code reviews will **reject** PRs with TypeScript errors
- ❌ CI will **fail** builds with type errors
- ❌ Pre-commit hooks will **block** commits with errors
- ✅ All code must pass `pnpm type-check` before merge

**No exceptions. Type safety is non-negotiable.**

# Commit Message Cheatsheet

Quick reference for writing conventional commit messages.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | - |
| `style` | Code formatting (whitespace, semicolons) | - |
| `refactor` | Code refactoring | - |
| `perf` | Performance improvement | PATCH |
| `test` | Adding or updating tests | - |
| `build` | Build system or dependencies | - |
| `ci` | CI/CD configuration | - |
| `chore` | Maintenance tasks | - |
| `revert` | Revert previous commit | - |
| `security` | Security improvements | PATCH |

## Common Examples

### Features
```bash
feat: add request cancellation support
feat(entities): add batch update operation
feat(http): implement retry with exponential backoff
feat(auth): support JWT token authentication
feat(proxy): add corporate proxy support with auth
feat(logger): add structured logging with log levels
```

### Bug Fixes
```bash
fix: resolve token refresh race condition
fix(http): prevent duplicate concurrent token refreshes
fix(proxy): properly encode special characters in credentials
fix(entities): correct parameter order in update method
fix(validation): validate identifier format correctly
fix(types): export missing TypeScript interfaces
```

### Documentation
```bash
docs: update README with correct examples
docs: add API documentation for blueprints
docs: create troubleshooting guide
docs: update CHANGELOG for v0.1.0
docs: add JSDoc comments to public methods
docs: fix broken links in documentation
```

### Tests
```bash
test: add integration tests for actions
test(http): add token refresh race condition tests
test(entities): add batch operations tests
test: improve coverage for config module
test: add smoke tests for CRUD operations
test(unit): add validation error scenarios
```

### Chores
```bash
chore: bump version to 0.1.0
chore: update dependencies
chore: prepare for v0.1.0 release
chore: clean up unused files
chore: update package metadata for publishing
chore: configure Husky git hooks
```

### Refactoring
```bash
refactor: extract validation to utility functions
refactor(types): remove any types from resources
refactor(http): simplify error handling logic
refactor: consolidate duplicate code in resources
refactor(entities): improve type safety in transform methods
```

### Security
```bash
security: sanitize credentials in error logs
security: fix credential exposure in stack traces
security(proxy): properly encode proxy credentials
security: update dependencies with vulnerabilities
security: add input validation for user data
```

### CI/CD
```bash
ci: add GitHub Actions workflow for testing
ci: split workflows into parallel jobs
ci: add security scanning to pipeline
ci: configure coverage thresholds
ci: add integration test workflow
```

### Build
```bash
build: update tsup configuration
build: add TypeDoc for API documentation
build: configure package.json exports
build: optimize bundle size
build: add source maps to build output
```

## Breaking Changes

Add `!` after type/scope and include `BREAKING CHANGE:` in footer:

```bash
feat!: require Node 20+

BREAKING CHANGE: Node 18 is no longer supported.
Users must upgrade to Node 20 or later.

Migration guide: https://docs.example.com/migration
```

```bash
refactor!: change entity update method signature

BREAKING CHANGE: Entity.update() now requires blueprint as third parameter.

Before: update(id, data)
After: update(id, data, blueprint)
```

## Scopes

Common scopes in this project:

- `entities` - Entity resource operations
- `blueprints` - Blueprint resource operations
- `actions` - Action resource operations
- `scorecards` - Scorecard resource operations
- `http` - HTTP client functionality
- `auth` - Authentication logic
- `config` - Configuration management
- `logger` - Logging infrastructure
- `types` - TypeScript type definitions
- `tests` - Test infrastructure
- `docs` - Documentation
- `ci` - CI/CD pipeline

## Full Examples

### Feature with Scope and Body
```bash
feat(entities): add batch update operation

Allows updating multiple entities in a single API call,
improving performance for bulk operations.

Closes #45
```

### Bug Fix with Issue Reference
```bash
fix(http): prevent token refresh race condition

Multiple concurrent requests could trigger duplicate token
refreshes. Now uses promise-based locking to ensure only
one refresh happens at a time.

Fixes #123
```

### Documentation Update
```bash
docs(readme): add proxy configuration examples

Added examples for:
- HTTP proxy without authentication
- HTTPS proxy with authentication
- NO_PROXY environment variable

Closes #67
```

### Security Fix
```bash
security(auth): sanitize credentials in error logs

Prevents accidental credential exposure in error messages
and stack traces. Credentials are now replaced with [REDACTED].
```

### Breaking Change
```bash
feat!: upgrade to vitest v3

BREAKING CHANGE: Vitest v2 is no longer supported.
Update your test configuration to use v3 syntax.

Migration steps:
1. Update vitest to v3: pnpm add -D vitest@3
2. Update test configuration
3. Run tests to verify compatibility
```

## Multi-line Commits

For complex changes:

```bash
feat(http): implement comprehensive retry logic

Features:
- Exponential backoff with configurable delay
- Retry on network errors and 5xx responses
- Respect Retry-After header for 429 responses
- Skip retry on 4xx client errors
- Maximum retry attempts configurable

Breaking: Default maxRetries changed from 5 to 3.

Closes #89
Closes #102
```

## Tips

### ✅ DO
- Use imperative mood: "add" not "added" or "adds"
- Use lowercase for subject
- Keep subject under 100 characters
- Separate subject from body with blank line
- Explain WHY in body, not HOW
- Reference issues: `Closes #123`, `Fixes #456`, `Refs #789`

### ❌ DON'T
- Don't capitalize subject first letter
- Don't end subject with period
- Don't include type emoji (use text type instead)
- Don't mix multiple unrelated changes
- Don't use vague subjects like "fix bug" or "update code"

## Bad vs Good Examples

### ❌ Bad
```bash
updated code
Fix bug
Added feature
fixes
WIP
misc changes
```

### ✅ Good
```bash
feat(entities): add search operation
fix(http): resolve timeout issue
docs: update installation guide
test: add CRUD operation tests
chore: update dependencies
refactor: simplify validation logic
```

## Quick Commands

```bash
# Standard commit
git commit -m "feat: add new feature"

# With scope
git commit -m "feat(entities): add batch operations"

# With body (multi-line)
git commit -m "feat: add new feature" -m "Detailed description here"

# Amend last commit message
git commit --amend -m "feat: corrected message"

# Bypass hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"
```

## Validation

Your commits are automatically validated by commitlint. If validation fails:

```bash
# Check what went wrong
echo "your message" | npx commitlint

# Fix and recommit
git commit --amend -m "feat: corrected message"
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Semantic Versioning](https://semver.org/)
- [Full Guidelines](./.cursor/rules/changelog-automation.mdc)

---

**Quick Reference Card** (print or save):

```
TYPES:
feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, security

FORMAT:
<type>(<scope>): <subject>

EXAMPLE:
feat(entities): add batch update operation

BREAKING:
feat!: require Node 20+
BREAKING CHANGE: ...
```


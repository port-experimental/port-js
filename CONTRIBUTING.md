# Contributing to Port SDK

Thank you for your interest in contributing to the Port SDK! This document provides guidelines and instructions for contributing.

## 🌟 Code of Conduct

Be respectful, inclusive, and professional. We're all here to build great software together.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/port-experimental/port-sdk.git
cd port-sdk

# Install dependencies
pnpm install

# Generate types from OpenAPI spec
pnpm generate-types

# Build the project
pnpm build

# Run tests
pnpm test

# Run type checking
pnpm type-check
```

### Development Workflow

```bash
# Start development mode (watch)
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# View test UI
pnpm test:ui

# Run integration tests (requires credentials)
PORT_CLIENT_ID=xxx PORT_CLIENT_SECRET=yyy pnpm test:integration
```

## 📋 Development Guidelines

### 1. Security First

**CRITICAL**: Review `.cursorrules` before contributing. Security is our highest priority.

Key security principles:
- Never commit credentials or secrets
- Validate all inputs
- Sanitize error messages
- Audit dependencies before adding
- No `any` types in TypeScript
- Handle errors securely

### 2. TypeScript Standards

```typescript
// ✅ GOOD - Strict typing
function processEntity(entity: Entity): ProcessedEntity {
  if (!isValidEntity(entity)) {
    throw new ValidationError('Invalid entity');
  }
  return transform(entity);
}

// ❌ BAD - Using any
function processEntity(entity: any): any {
  return entity;
}
```

Requirements:
- Use TypeScript strict mode
- No `any` types (use `unknown` if needed)
- Prefer `readonly` for immutable data
- Document public APIs with JSDoc

### 3. Testing Requirements

All contributions must include tests:

```typescript
// Unit test example
describe('EntityResource.create()', () => {
  it('should create entity with valid data', async () => {
    const entity = await resource.create(validData);
    expect(entity.identifier).toBe(validData.identifier);
  });

  it('should throw ValidationError for invalid data', async () => {
    await expect(resource.create(invalidData))
      .rejects.toThrow(PortValidationError);
  });
});
```

Requirements:
- Unit tests for all new functionality
- Integration tests for API interactions
- Security tests for sensitive operations
- Minimum 90% code coverage

### 4. Code Style

We use TypeScript with strict mode:

```typescript
// Formatting
- Use 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multiline
- Semicolons required

// Naming conventions
- camelCase for variables and functions
- PascalCase for classes and types
- UPPER_CASE for constants
- Private properties prefixed with _
```

### 5. Commit Messages

**REQUIRED**: All commits MUST use [Conventional Commits](https://www.conventionalcommits.org/) format.

Commitlint runs automatically on every commit to enforce this.

```bash
feat: add entity batch operations
fix: resolve token refresh race condition
docs: update README with proxy configuration
test: add integration tests for actions
refactor: simplify error handling logic
security: patch credential exposure in logs
```

Types:
- `feat`: New feature (MINOR version bump)
- `fix`: Bug fix (PATCH version bump)
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `security`: Security improvements (PATCH version bump)
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

**Breaking Changes**: Use `feat!:` or include `BREAKING CHANGE:` in footer (MAJOR version bump)

```bash
feat!: drop support for Node 18

BREAKING CHANGE: Node 20+ is now required
```

**See**: 
- [Commit Message Cheatsheet](./docs/development/COMMIT_MESSAGES.md) - Quick reference
- [Complete Guidelines](./.cursor/rules/changelog-automation.mdc) - Full documentation

## 🔧 Contributing Process

### 1. Create an Issue

Before starting work:
- Check existing issues and PRs
- Create an issue describing the change
- Discuss approach with maintainers
- Get approval for large changes

### 2. Fork and Branch

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/port-sdk.git

# Add upstream remote
git remote add upstream https://github.com/port-experimental/port-sdk.git

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

```bash
# Make your changes
# Add tests
# Update documentation

# Run checks
pnpm test
pnpm type-check
pnpm build

# Run security audit
pnpm audit
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add your feature"

# Push to your fork
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to GitHub and create a Pull Request
2. Fill out the PR template
3. Link related issues
4. Wait for review

### PR Checklist

Before submitting:

- [ ] Code follows style guidelines
- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No security vulnerabilities (`pnpm audit`)
- [ ] Documentation updated
- [ ] Tests added for new functionality
- [ ] Commit messages follow convention
- [ ] No credentials or secrets in code
- [ ] Security guidelines followed (`.cursorrules`)

## 📚 Documentation

### Adding Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md
- Create examples for new features

### Documentation Style

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

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// Organize tests by functionality
describe('EntityResource', () => {
  describe('create()', () => {
    it('should create entity with valid data', () => {});
    it('should validate required fields', () => {});
    it('should handle network errors', () => {});
  });

  describe('update()', () => {
    // Update tests
  });
});
```

### Test Coverage

Aim for:
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

```bash
# Check coverage
pnpm test:coverage

# View HTML report
open coverage/index.html
```

## 🔍 Code Review Process

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work as expected)
- [ ] Documentation update

## Motivation
Why is this change needed?

## Changes Made
- List of changes
- With brief descriptions

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing locally
- [ ] Coverage maintained/improved

## Security Checklist
- [ ] No credentials in code
- [ ] Input validation added
- [ ] Error messages sanitized
- [ ] Dependencies audited
- [ ] Security guidelines followed

## Documentation
- [ ] README updated (if needed)
- [ ] CHANGELOG updated
- [ ] JSDoc comments added
- [ ] Examples added (if new feature)

## Related Issues
Closes #XXX
```

### For Contributors

#### During Development

1. **Keep PRs focused**
   - One feature or fix per PR
   - Avoid mixing refactoring with features
   - Split large changes into smaller PRs

2. **Write descriptive commits**
   ```bash
   # Good
   feat(entities): add batch update operation
   fix(http): prevent token refresh race condition
   
   # Bad
   update code
   fix bug
   ```

3. **Test thoroughly**
   ```bash
   # Before pushing
   pnpm test
   pnpm test:coverage
   pnpm type-check
   pnpm build
   pnpm audit --prod
   ```

#### Responding to Reviews

- **Respond promptly** (within 1-2 days if possible)
- **Be open to feedback** - reviewers want to help
- **Ask questions** if feedback is unclear
- **Request re-review** after addressing feedback
- **Mark conversations resolved** when addressed

#### Example Response to Feedback

```markdown
> Consider adding validation for empty strings

Good catch! Added validation in commit abc123.

> This could be simplified using Array.filter()

Refactored in commit def456. Much cleaner now!

> What happens if the API returns a 500 error here?

Added retry logic with exponential backoff. Also added test coverage for this scenario.
```

### For Reviewers

#### Review Priorities

1. **Security** (Critical)
   - No hardcoded credentials
   - Proper input validation
   - Safe error handling
   - No sensitive data in logs

2. **Correctness** (Critical)
   - Logic is correct
   - Edge cases handled
   - No breaking changes (unless intentional)

3. **Testing** (High)
   - Tests exist and are meaningful
   - Coverage maintained
   - Tests actually test the right thing

4. **Code Quality** (High)
   - Follows style guidelines
   - TypeScript strict mode compliance
   - Clear naming
   - Reasonable complexity

5. **Documentation** (Medium)
   - Public APIs documented
   - README updated if needed
   - Examples provided for new features

#### Review Checklist

```markdown
### Security ⚠️
- [ ] No credentials or secrets in code
- [ ] Input validation present
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are from trusted sources
- [ ] No `eval()` or unsafe code execution

### Functionality ✅
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error paths tested
- [ ] No obvious bugs
- [ ] Breaking changes documented

### Code Quality 📝
- [ ] TypeScript strict mode (no `any`)
- [ ] Clear naming
- [ ] Reasonable complexity
- [ ] No code duplication
- [ ] Follows existing patterns

### Testing 🧪
- [ ] Unit tests present
- [ ] Integration tests if needed
- [ ] Tests are clear and focused
- [ ] Coverage maintained (>90%)
- [ ] Tests actually run and pass

### Documentation 📚
- [ ] JSDoc for public APIs
- [ ] README updated if needed
- [ ] CHANGELOG updated
- [ ] Examples provided
- [ ] Clear commit messages

### Performance ⚡
- [ ] No obvious performance issues
- [ ] Async operations handled correctly
- [ ] No memory leaks
- [ ] Rate limiting respected
```

#### Providing Feedback

**Be constructive and specific:**

```markdown
# ✅ Good feedback
Consider using `Promise.all()` here to parallelize these requests.
This would reduce the total time from ~5s to ~1s.

# ❌ Vague feedback
This is slow.
```

**Distinguish between blocking and non-blocking:**

```markdown
# Blocking (must fix)
⚠️ **Blocking**: This exposes the API token in error messages.
Please sanitize before logging.

# Non-blocking (suggestion)
💡 **Suggestion**: Consider extracting this logic into a helper function
for better reusability. Not blocking, but would improve maintainability.
```

**Recognize good work:**

```markdown
Nice! This is a much cleaner approach than what we had before.

Great test coverage on this edge case!

Love the detailed JSDoc comments here. 👍
```

#### Review Timeline

- **Initial review**: Within 2 business days
- **Follow-up reviews**: Within 1 business day
- **Small fixes**: Same day if possible

#### Approval Criteria

A PR can be approved when:
- [ ] All blockers addressed
- [ ] Tests pass in CI
- [ ] No security concerns
- [ ] Code quality meets standards
- [ ] Documentation complete

At least **2 approvals** required for:
- Breaking changes
- Security-related changes
- Major new features

## 🐛 Reporting Bugs

### Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Email: security@getport.io

### Other Bugs

Open an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Code samples or error messages

## 💡 Feature Requests

Open an issue with:
- Clear description of the feature
- Use cases and motivation
- Proposed API or implementation
- Willingness to contribute

## 📦 Release Process

(For maintainers)

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking API changes
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, backward compatible

### Pre-Release Checklist

Before releasing:

1. **All tests pass**
   ```bash
   pnpm test
   pnpm test:integration
   pnpm test:coverage
   ```

2. **No security vulnerabilities**
   ```bash
   pnpm audit --prod
   ```

3. **Build succeeds**
   ```bash
   pnpm build
   ```

4. **Type checking passes**
   ```bash
   pnpm type-check
   pnpm types:check
   ```

5. **Smoke tests pass**
   ```bash
   pnpm smoke
   ```

6. **Documentation updated**
   - README.md
   - CHANGELOG.md
   - API documentation

### Release Steps

#### 1. Update Version

```bash
# Patch release (0.1.0 → 0.1.1)
pnpm version:patch

# Minor release (0.1.0 → 0.2.0)
pnpm version:minor

# Major release (0.1.0 → 1.0.0)
pnpm version:major

# Pre-release (0.1.0 → 0.1.1-beta.0)
pnpm version:prerelease
```

This will:
- Update package.json version
- Create a git commit
- Create a git tag
- Push to remote with tags

#### 2. Update CHANGELOG.md

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [0.2.0] - 2025-10-05

### Added
- Entity batch operations support
- Request cancellation with AbortController

### Fixed
- Token refresh race condition
- Proxy credential encoding

### Changed
- Updated vitest to v3.2.4

### Security
- Fixed credential exposure in error logs
```

#### 3. Verify Package Contents

```bash
# Test package creation
npm pack --dry-run

# Check package size and contents
npm pack
tar -tzf port-experimental-port-sdk-*.tgz

# Test local installation
npm install ./port-experimental-port-sdk-*.tgz
```

#### 4. Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish stable release
npm publish --access public

# Or publish beta release
npm publish --access public --tag beta
```

#### 5. Create GitHub Release

1. Go to [Releases](https://github.com/port-experimental/port-sdk/releases)
2. Click "Draft a new release"
3. Select the version tag
4. Add release notes from CHANGELOG.md
5. Attach build artifacts (optional)
6. Mark as pre-release if beta
7. Publish release

#### 6. Post-Release

```bash
# Verify on npm
npm view @port-experimental/port-sdk

# Test installation
npm install @port-experimental/port-sdk

# Announce release
# - Update documentation site
# - Post in Slack community
# - Tweet about major releases
```

### Rollback Strategy

If a release has critical issues:

```bash
# Deprecate the broken version
npm deprecate @port-experimental/port-sdk@x.x.x "Critical bug, use x.x.y instead"

# Publish a patch release with the fix
pnpm version:patch
# Fix the issue
pnpm build && pnpm test
npm publish

# If absolutely necessary, unpublish (within 72 hours)
npm unpublish @port-experimental/port-sdk@x.x.x
```

## 🤝 Community

- 💬 [Slack Community](https://www.getport.io/community)
- 🐛 [GitHub Issues](https://github.com/port-experimental/port-sdk/issues)
- 📖 [Documentation](https://docs.getport.io)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Port SDK! 🎉


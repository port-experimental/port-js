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
git clone https://github.com/port-labs/port-sdk.git
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
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `security`: Security improvements
- `chore`: Maintenance tasks

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
git remote add upstream https://github.com/port-labs/port-sdk.git

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

### For Contributors

- Respond to feedback promptly
- Be open to suggestions
- Ask questions if unclear
- Update PR based on feedback

### For Reviewers

Review checklist:
- [ ] Security: No credentials, proper validation, safe errors
- [ ] Code quality: Typed, tested, documented
- [ ] Functionality: Works as intended, handles edge cases
- [ ] Performance: No obvious bottlenecks
- [ ] Documentation: Clear and complete

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

```bash
# Update version
npm version patch|minor|major

# Update CHANGELOG.md

# Build and test
pnpm build
pnpm test
pnpm audit

# Publish
pnpm publish

# Push tags
git push --tags
```

## 🤝 Community

- 💬 [Slack Community](https://www.getport.io/community)
- 🐛 [GitHub Issues](https://github.com/port-labs/port-sdk/issues)
- 📖 [Documentation](https://docs.getport.io)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Port SDK! 🎉


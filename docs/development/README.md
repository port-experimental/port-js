# Development Documentation

Documentation for contributing to and maintaining the Port SDK.

## 📚 Table of Contents

### Getting Started
- [Contributing Guide](../../CONTRIBUTING.md) - How to contribute
- [Development Setup](#development-setup) - Set up your development environment
- [Coding Standards](./STANDARDS.md) - Code style and best practices

### Core Concepts
- [Type Generation](./TYPE_GENERATION.md) - How types are generated from OpenAPI
- [API Documentation](./API_DOCUMENTATION.md) - Generating and maintaining API docs with TypeDoc
- [Testing Guide](../TESTING.md) - Testing strategy and practices
- [Security Guidelines](./SECURITY_GUIDELINES.md) - Security best practices

### Maintenance
- [Updating Types](../UPDATING_TYPES.md) - Update API types
- [Release Process](#release-process) - How to release new versions
- [Changelog](../../CHANGELOG.md) - Version history

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git
- A Port.io account with API credentials

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/port-labs/port-sdk.git
cd port-sdk

# Install dependencies
pnpm install
```

### Configure Credentials

```bash
# Create .env.local for development
cat > .env.local << EOF
PORT_CLIENT_ID=your_client_id
PORT_CLIENT_SECRET=your_client_secret
PORT_REGION=eu
EOF
```

### Verify Setup

```bash
# Type check
pnpm type-check

# Run tests
pnpm test

# Build the SDK
pnpm build
```

## Common Development Tasks

### Run Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# Integration tests (requires credentials)
pnpm test:integration
```

### Update API Types

```bash
# Download latest OpenAPI spec
pnpm types:download

# Generate TypeScript types
pnpm types:generate

# Or do both at once
pnpm types:update
```

See [Type Generation Guide](./TYPE_GENERATION.md) for details.

### Build the SDK

```bash
# Build for distribution
pnpm build

# Watch mode for development
pnpm build --watch
```

### Run Examples

```bash
# Setup example credentials
cp examples/.env.example examples/.env
# Edit examples/.env with your credentials

# Run an example
pnpm tsx examples/01-basic-usage.ts
```

### Run Smoke Tests

```bash
# All smoke tests
pnpm smoke

# Individual test
pnpm smoke:service
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### 2. Write Tests First (TDD)

```typescript
// tests/unit/my-feature.test.ts
describe('MyFeature', () => {
  it('should do something', () => {
    // Write test first
  });
});
```

### 3. Implement the Feature

```typescript
// src/my-feature.ts
export function myFeature() {
  // Implement to make tests pass
}
```

### 4. Verify Everything Passes

```bash
# Type check
pnpm type-check

# Tests
pnpm test

# Coverage
pnpm test:coverage

# Build
pnpm build
```

### 5. Update Documentation

- Update README if needed
- Add examples if applicable
- Update CHANGELOG.md
- Add JSDoc comments

### 6. Create Pull Request

```bash
git add .
git commit -m "feat: add my new feature"
git push origin feature/my-new-feature
```

Then create a PR on GitHub.

## Release Process

### 1. Update Version

```bash
# Patch release (0.1.0 -> 0.1.1)
pnpm version:patch

# Minor release (0.1.0 -> 0.2.0)
pnpm version:minor

# Major release (0.1.0 -> 1.0.0)
pnpm version:major
```

### 2. Verify Release

```bash
# Check version
cat package.json | grep version

# Verify build
pnpm build

# Test installation locally
npm pack
npm install port-labs-port-sdk-0.1.0.tgz -g
```

### 3. Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish
npm publish --access public
```

### 4. Create GitHub Release

```bash
# Tag is auto-created by version:* scripts
git push && git push --tags

# Create release on GitHub with:
# - Release notes from CHANGELOG
# - Built artifacts if needed
```

## Project Structure

```
port-js/
├── .cursor/              # Cursor AI rules
│   ├── rules/           # Development rules
│   └── README.md
├── docs/                # Documentation
│   ├── api/            # API reference
│   ├── development/    # Development guides
│   ├── getting-started/# Getting started guides
│   └── guides/         # How-to guides
├── examples/           # Runnable examples
├── smoke-tests/        # Manual verification tests
├── src/                # Source code
│   ├── resources/      # API resource classes
│   ├── types/          # TypeScript types
│   ├── client.ts       # Main client
│   ├── config.ts       # Configuration
│   ├── errors.ts       # Error classes
│   ├── http-client.ts  # HTTP client
│   ├── logger.ts       # Logging
│   └── index.ts        # Public exports
├── tests/              # Tests
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── fixtures/       # Test data
│   └── helpers/        # Test utilities
├── CHANGELOG.md        # Version history
├── CONTRIBUTING.md     # Contribution guide
├── LICENSE            # MIT license
├── package.json       # Package config
├── README.md          # Main documentation
├── SECURITY.md        # Security policy
├── tsconfig.json      # TypeScript config
└── vitest.config.ts   # Test config
```

## Key Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm build` | Build the SDK |
| `pnpm type-check` | TypeScript type checking |
| `pnpm test` | Run unit tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm test:integration` | Run integration tests |
| `pnpm types:download` | Download OpenAPI spec |
| `pnpm types:generate` | Generate TypeScript types |
| `pnpm types:update` | Update types (download + generate) |
| `pnpm docs:generate` | Generate API documentation |
| `pnpm smoke` | Run smoke tests |
| `pnpm version:patch` | Bump patch version |
| `pnpm version:minor` | Bump minor version |
| `pnpm version:major` | Bump major version |

## Code Style

We follow strict TypeScript and testing standards:

- **TypeScript**: Strict mode, no `any` types
- **Testing**: TDD approach, 85%+ coverage
- **Security**: Security-first development
- **Documentation**: JSDoc for all public APIs

See [Standards Guide](./STANDARDS.md) for details.

## Getting Help

- Check the [FAQ](../FAQ.md)
- Read existing [documentation](../README.md)
- Ask in [GitHub Discussions](https://github.com/port-labs/port-sdk/discussions)
- Contact Port support: support@getport.io

## Contributing

We love contributions! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for:

- Code of Conduct
- How to contribute
- Pull request process
- Development guidelines

---

**Happy coding!** 🚀


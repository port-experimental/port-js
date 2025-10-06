# Cursor Rules

AI coding assistant rules for maintaining code quality and consistency in the Port SDK.

## Core Rules

### 🔴 Critical (Always Applied)

- **[core.mdc](./rules/core.mdc)** - Core SDK development principles
- **[tdd-requirements.mdc](./rules/tdd-requirements.mdc)** - Test-Driven Development (MANDATORY) ⭐
- **[typescript-validation.mdc](./rules/typescript-validation.mdc)** - TypeScript strict mode enforcement
- **[documentation-maintenance.mdc](./rules/documentation-maintenance.mdc)** - Keep docs in sync 📚 **NEW**

### 🟡 Standards (Development Guidelines)

- **[sdk-development-standards.mdc](./rules/sdk-development-standards.mdc)** - SDK architecture patterns
- **[api-client-patterns.mdc](./rules/api-client-patterns.mdc)** - HTTP client and resource patterns
- **[typescript-best-practices.mdc](./rules/typescript-best-practices.mdc)** - TypeScript coding standards
- **[testing-standards.mdc](./rules/testing-standards.mdc)** - Testing best practices

### 🟢 Process (Workflow & Release)

- **[version-management.mdc](./rules/version-management.mdc)** - Semantic versioning and releases 📦
- **[changelog-automation.mdc](./rules/changelog-automation.mdc)** - Changelog maintenance

## Core Principles

1. 🔐 **Security First** - No compromises on security, credentials never logged
2. 🧪 **Test-Driven Development** - Write tests before code (MANDATORY)
3. 📘 **Type Safety** - Strict TypeScript, no `any`, 100% type-checked
4. 📚 **Documentation in Sync** - Code without updated docs is incomplete
5. 🎯 **User Focused** - Easy to use, hard to misuse
6. 📦 **Semantic Versioning** - Follow semver strictly for all releases
7. ✅ **High Coverage** - Maintain 90%+ test coverage

## Quick Start for Contributors

### Before Writing Code

1. ✅ Read [tdd-requirements.mdc](./rules/tdd-requirements.mdc) - **MANDATORY**
2. ✅ Read [documentation-maintenance.mdc](./rules/documentation-maintenance.mdc)
3. ✅ Understand the feature requirements
4. ✅ Plan what tests you'll write
5. ✅ Plan what documentation will be updated

### While Writing Code

1. ✅ Write tests FIRST (TDD)
2. ✅ Use strict TypeScript (no `any`)
3. ✅ Add JSDoc comments with examples
4. ✅ Follow patterns in [sdk-development-standards.mdc](./rules/sdk-development-standards.mdc)

### Before Committing

1. ✅ All tests pass: `pnpm test`
2. ✅ Type check passes: `pnpm type-check`
3. ✅ Coverage is maintained: `pnpm test:coverage`
4. ✅ Examples work: `pnpm tsx examples/*.ts`
5. ✅ README updated if user-facing change
6. ✅ CHANGELOG updated
7. ✅ Documentation updated

## Documentation

For detailed guidelines, see:
- [TDD Requirements](./rules/tdd-requirements.mdc) - **READ THIS FIRST**
- [Documentation Maintenance](./rules/documentation-maintenance.mdc) - **READ THIS SECOND**
- [Development Standards](../docs/development/README.md)
- [Testing Guide](../docs/TESTING.md)
- [Contributing Guide](../CONTRIBUTING.md)


# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Smoke tests for system blueprints (_team, _user, _scorecard, _rule, _rule_result)
- Version management scripts (version:patch, version:minor, version:major, version:prerelease)
- Comprehensive version management cursor rules
- Documentation maintenance cursor rules (`documentation-maintenance.mdc`)
- Example files for webhooks (23-webhooks-crud.ts), audit logs (24-audit-logs.ts), and action runs (25-action-runs.ts)
- API Implementation Roadmap (`docs/API_IMPLEMENTATION_ROADMAP.md`) - Complete plan for 100% API coverage
- Expanded integration tests: Actions, Teams, Users
- Performance benchmarking suite (`tests/performance/`) with comprehensive metrics
- Security audit checklist (`docs/SECURITY_AUDIT_CHECKLIST.md`) for release preparation
- `test:benchmark` script to run performance tests

### Changed
- **BREAKING**: License changed from MIT to Apache-2.0
- Updated README coverage stats from 78.69% to 86.6%
- Added webhook usage examples to README
- Enhanced cursor rules README with better organization

### Documentation
- Updated all license references across documentation
- Added comprehensive performance testing guide
- Added security audit process documentation
- Created implementation roadmap for missing API resources

## [0.1.0] - 2025-10-04

### Added
- Initial SDK implementation with full TypeScript support
- Auto-generated types from OpenAPI specification
- Custom error classes (PortError, PortAuthError, PortNotFoundError, PortValidationError, etc.)
- HTTP client with automatic retries, exponential backoff, and timeout handling
- Multi-region support (EU and US instances)
- OAuth2 and JWT authentication methods
- Environment variable and `.env` file configuration support
- HTTP/HTTPS proxy support with authentication and NO_PROXY handling
- Configuration precedence: explicit config > env vars > .env file > defaults
- Cross-platform logging system (Windows, macOS, Linux)
- Log levels: ERROR, WARN, INFO, DEBUG, TRACE
- Secure logging with credential sanitization
- **EntityResource** - Full CRUD operations (create, get, update, delete, list, search, batch operations, relations)
- **BlueprintResource** - Full CRUD operations (create, get, update, delete, list, getRelations)
- **ActionResource** - Full CRUD operations plus execute, getRun, listRuns
- **ScorecardResource** - Full CRUD operations (create, get, update, delete, list)
- Main PortClient tying all resources together
- 258 comprehensive unit tests with 85.4% coverage
- Test-Driven Development (TDD) workflow
- GitHub Actions CI/CD with automated testing
- Security-first development with comprehensive cursor rules
- Examples directory with working code samples
- Smoke tests for manual API verification
- Comprehensive documentation (README, SECURITY, CONTRIBUTING, CHANGELOG)

### Security
- [SECURITY] No credentials stored on disk
- [SECURITY] Tokens stored in memory only
- [SECURITY] Automatic token refresh before expiry
- [SECURITY] Sanitized error messages (no credential leaks)
- [SECURITY] SSL certificate validation enabled
- [SECURITY] Secure proxy credential handling
- [SECURITY] Input validation on all user-provided data
- [SECURITY] TypeScript strict mode enforced
- [SECURITY] Dependency security auditing guidelines
- [SECURITY] Comprehensive security cursor rules

---

## Release Guidelines

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)

### Tags

- `[SECURITY]` - Security-related changes
- `[BREAKING]` - Breaking changes requiring major version bump
- `[DEPRECATED]` - Features marked for removal

### Examples

```markdown
## [1.2.0] - 2025-01-15

### Added
- Entity batch operations for improved performance
- Query builder for advanced entity filtering

### Fixed
- Token refresh race condition
- Proxy authentication with special characters

### Security
- [SECURITY] Updated dependencies to patch CVE-2024-XXXXX
- [SECURITY] Enhanced input validation for entity identifiers

### Deprecated
- `client.entities.legacySearch()` - Use `client.entities.search()` instead
```

---

For more information, see:
- [GitHub Releases](https://github.com/port-labs/port-sdk/releases)
- [npm Package](https://www.npmjs.com/package/@port-labs/port-sdk)


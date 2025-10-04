# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial SDK implementation
- TypeScript support with auto-generated types from OpenAPI spec
- Comprehensive error handling with custom error classes
- HTTP client with automatic retries and exponential backoff
- Multi-region support (EU and US instances)
- OAuth2 and JWT authentication methods
- Environment variable configuration support
- `.env` file support with dotenv
- HTTP/HTTPS proxy support with authentication
- NO_PROXY environment variable support
- Configuration precedence: explicit config > env vars > .env file > defaults
- Secure credential management
- Request timeout configuration
- Retry configuration with exponential backoff
- Rate limiting support
- Security-first development rules (`.cursorrules`)
- Comprehensive documentation (README, SECURITY, CONTRIBUTING)
- Type-safe resource classes (BaseResource)
- Organized type definitions by domain

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

## [0.1.0] - TBD

### Added
- Initial release
- Core SDK functionality
- Entity operations (planned)
- Blueprint operations (planned)
- Action operations (planned)
- Scorecard operations (planned)

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


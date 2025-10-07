# Security Policy

## 🔐 Security First

Security is our highest priority. This SDK is built with security-first principles to protect your Port.io credentials and data.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@getport.io**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., credential exposure, injection vulnerability, etc.)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

### 1. Credential Management

✅ **DO:**
- Use environment variables for credentials
- Store credentials in secure vault systems (AWS Secrets Manager, HashiCorp Vault, etc.)
- Use `.env` files for local development (add to `.gitignore`)
- Rotate credentials regularly
- Use OAuth2 client credentials flow when possible
- Implement credential validation before use

❌ **DON'T:**
- Hardcode credentials in source code
- Commit credentials to version control
- Share credentials in logs, error messages, or debug output
- Use production credentials in development/testing
- Store credentials in browser localStorage/sessionStorage

### 2. Network Security

✅ **DO:**
- Always use HTTPS for API communication
- Validate SSL/TLS certificates
- Use secure proxy configurations
- Implement request timeouts
- Handle rate limiting appropriately

❌ **DON'T:**
- Disable SSL certificate validation
- Use HTTP for sensitive data
- Log proxy credentials
- Ignore rate limit responses

### 3. Input Validation

✅ **DO:**
- Validate all user input
- Sanitize strings used in URLs
- Use parameterized queries
- Implement type checking
- Set reasonable limits on input sizes

❌ **DON'T:**
- Trust user input without validation
- Interpolate user input directly into queries
- Execute user input as code
- Skip validation for "trusted" sources

### 4. Error Handling

✅ **DO:**
- Return generic error messages to users
- Log detailed errors securely (server-side only)
- Sanitize error messages
- Handle all error cases

❌ **DON'T:**
- Expose stack traces to users
- Include credentials in error messages
- Leak internal system information
- Expose database queries or internal logic

### 5. Dependency Security

✅ **DO:**
- Audit dependencies before adding (`pnpm audit`)
- Keep dependencies up to date
- Review dependency changelogs
- Pin dependency versions
- Use dependencies from trusted sources

❌ **DON'T:**
- Install dependencies without review
- Ignore security advisories
- Use dependencies with known vulnerabilities
- Use dependencies from untrusted sources

## Security Features

### 1. Automatic Token Management
- Tokens are stored in memory only
- Automatic token refresh before expiry
- Tokens cleared on error or session end

### 2. Request Security
- HTTPS-only communication
- SSL certificate validation
- Request/response encryption in transit
- Secure header handling

### 3. Rate Limiting
- Client-side rate limiting
- Exponential backoff on retry
- Respect server rate limit headers
- Prevent API abuse

### 4. Proxy Support
- Secure proxy authentication
- NO_PROXY environment support
- Proxy credential protection
- HTTPS through HTTP proxy support

### 5. Error Safety
- No sensitive data in error messages
- Sanitized stack traces
- Secure error logging
- Generic user-facing errors

## Security Checklist for Development

Before committing code:

- [ ] No hardcoded credentials or secrets
- [ ] All inputs validated and sanitized
- [ ] Error messages don't leak sensitive information
- [ ] No new dependencies without security review
- [ ] TypeScript strict mode passes
- [ ] `pnpm audit` shows no high/critical vulnerabilities
- [ ] Tests cover security scenarios
- [ ] Documentation updated for security changes

## Dependency Auditing

Run security audits regularly:

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities automatically (if safe)
pnpm audit --fix

# Check for outdated packages
pnpm outdated

# Update dependencies (with testing)
pnpm update --interactive
```

## Vulnerability Response Timeline

| Severity | Response Time | Patch Timeline |
|----------|--------------|----------------|
| Critical | 24 hours | 48 hours |
| High | 48 hours | 7 days |
| Moderate | 7 days | 30 days |
| Low | 30 days | Next release |

## Security Updates

Security updates will be released as:
- **Patch versions** (0.1.x) for minor security fixes
- **Minor versions** (0.x.0) for significant security improvements
- **Major versions** (x.0.0) for security-related breaking changes

All security updates will be documented in the [CHANGELOG](CHANGELOG.md) with a `[SECURITY]` tag.

## Security Testing

The SDK includes:
- Input validation tests
- Authentication/authorization tests
- Error handling tests
- Rate limiting tests
- Network security tests
- Dependency vulnerability scans

## Compliance

This SDK is designed to support compliance with:
- GDPR (General Data Protection Regulation)
- SOC 2 (System and Organization Controls)
- ISO 27001 (Information Security Management)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Snyk Security Database](https://security.snyk.io/)

## Contact

- Ask in [GitHub Discussions](https://github.com/port-experimental/port-sdk/discussions)
---

Thank you for helping keep Port SDK secure! 🔐


# Security Guidelines

Security-first development guidelines for Port SDK.

## Core Principles

1. 🔐 **Never trust user input**
2. 🔒 **Never hardcode credentials**
3. 🛡️ **Validate everything**
4. 🔍 **Audit dependencies religiously**
5. 📝 **Log securely, never expose secrets**

## Dependency Security

### Before Adding Dependencies

```bash
# 1. Check package reputation
npm info <package-name>

# 2. Check security advisories
pnpm audit

# 3. Review package.json
npm view <package-name>

# 4. Check GitHub repository
# Verify: age, stars, issues, maintainers
```

### Red Flags

❌ Package created in last 30 days (unless from trusted org)
❌ Package with < 1000 downloads/week
❌ No GitHub repository or suspicious repo
❌ Typosquatting similarity to popular packages
❌ Known CVEs or security issues

### Approved Sources

✅ Official packages (@types, @port-experimental, etc.)
✅ Well-established packages (> 1 year, > 100k downloads/week)
✅ Active maintenance and security track record

## Credential Management

### NEVER Hardcode Credentials

❌ **Bad**:
```typescript
const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',      // NO!
    clientSecret: 'your-secret',     // NO!
  },
});
```

✅ **Good**:
```typescript
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});
```

### Never Log Credentials

```typescript
// ✅ GOOD - Sanitized logging
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
```

## Input Validation

### Always Validate User Input

```typescript
// ✅ GOOD - Validated and sanitized
function getEntity(identifier: string): Promise<Entity> {
  if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
    throw new ValidationError('Invalid identifier format');
  }
  return this.httpClient.get(`/entities/${encodeURIComponent(identifier)}`);
}

// ❌ BAD - No validation
function getEntity(identifier: string): Promise<Entity> {
  return this.httpClient.get(`/entities/${identifier}`); // Injection risk!
}
```

### Validation Rules

- ✅ Validate lengths, formats, ranges
- ✅ Sanitize strings used in URLs
- ✅ Use parameterized queries
- ❌ Never execute user input as code
- ❌ Never interpolate user input directly

## Error Handling

### Never Expose Internals

```typescript
// ✅ GOOD - Safe error handling
try {
  await dangerousOperation();
} catch (error) {
  logger.error('Internal error:', error);
  throw new PortError('Operation failed. Please try again.');
}

// ❌ BAD - Exposes internals
try {
  await dangerousOperation();
} catch (error) {
  throw new Error(`Database query failed: ${error.stack}`);
}
```

### What to Hide

- ❌ Stack traces to users
- ❌ Database queries
- ❌ Internal paths
- ❌ System information
- ❌ Credentials in errors

## Network Security

### HTTPS Only

```typescript
// ✅ GOOD - HTTPS
const baseUrl = 'https://api.getport.io';

// ❌ BAD - HTTP
const baseUrl = 'http://api.getport.io';
```

### Validate Certificates

```typescript
// ✅ GOOD - Certificate validation enabled (default)
const response = await fetch(url);

// ❌ BAD - Disabled validation
const response = await fetch(url, {
  agent: new https.Agent({ rejectUnauthorized: false })
});
```

## Proxy Security

### Secure Proxy Configuration

```typescript
// ✅ GOOD - Credentials from environment
const proxy = {
  url: process.env.HTTP_PROXY!,
  auth: process.env.PROXY_AUTH_USERNAME ? {
    username: process.env.PROXY_AUTH_USERNAME,
    password: process.env.PROXY_AUTH_PASSWORD!,
  } : undefined,
};

// ❌ BAD - Hardcoded credentials
const proxy = {
  url: 'http://proxy.example.com:8080',
  auth: { username: 'user', password: 'pass' }, // NO!
};
```

### Never Log Proxy Credentials

```typescript
// ✅ GOOD - Sanitized
logger.debug('Using proxy', { url: proxy.url, hasAuth: !!proxy.auth });

// ❌ BAD - Logs credentials
logger.debug('Using proxy', proxy); // Contains password!
```

## Rate Limiting & DoS Prevention

### Client-Side Rate Limiting

```typescript
class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private requestsPerSecond: number;

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    // Implement throttling
  }
}
```

### Exponential Backoff

```typescript
private getRetryDelay(attempt: number): number {
  return this.retryDelay * Math.pow(2, attempt);
}
```

## Security Testing

### Test Error Paths

```typescript
it('should not expose credentials in errors', () => {
  const error = new PortAuthError('Auth failed');
  expect(error.message).not.toContain('clientSecret');
  expect(error.message).not.toContain('password');
});
```

### Test Input Validation

```typescript
it('should reject invalid identifiers', async () => {
  await expect(resource.get('../../../etc/passwd'))
    .rejects
    .toThrow(ValidationError);
});
```

## Security Checklist

Before every commit:

- [ ] No hardcoded credentials
- [ ] All inputs validated
- [ ] Error messages sanitized
- [ ] No `eval()` or similar
- [ ] No credentials in logs
- [ ] HTTPS only
- [ ] Dependencies audited
- [ ] Tests cover security scenarios

## Incident Response

If security issue detected:

1. **STOP** - Don't commit or deploy
2. **ASSESS** - Determine severity and scope
3. **FIX** - Implement secure solution
4. **TEST** - Verify fix works
5. **DOCUMENT** - Update security docs
6. **NOTIFY** - Inform stakeholders

## Vulnerability Response Timeline

| Severity | Response | Patch |
|----------|----------|-------|
| Critical | 24 hours | 48 hours |
| High | 48 hours | 7 days |
| Moderate | 7 days | 30 days |
| Low | 30 days | Next release |

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [npm Security](https://docs.npmjs.com/security-best-practices)
- [Snyk Database](https://security.snyk.io/)

## Contact

Security issues: **security@getport.io**

See also: [SECURITY.md](../../SECURITY.md)


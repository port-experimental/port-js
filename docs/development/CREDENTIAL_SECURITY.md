# Credential Security in Port SDK

## Overview

The Port SDK implements comprehensive credential sanitization to prevent accidental exposure of sensitive information in logs, error messages, and debugging output.

## Protected Credentials

The following credential types are **automatically redacted** from all log output:

### Port SDK Credentials
- ✅ `clientId` / `client_id` - OAuth client identifier
- ✅ `clientSecret` / `client_secret` - OAuth client secret
- ✅ `accessToken` / `access_token` - JWT access tokens
- ✅ `refreshToken` / `refresh_token` - Token refresh credentials
- ✅ `token` - Generic token field

### General Sensitive Data
- ✅ `password` - User passwords
- ✅ `secret` - API secrets
- ✅ `apikey` / `api_key` - API keys
- ✅ `authorization` - Authorization headers
- ✅ `auth` / `bearer` - Authentication data
- ✅ `credentials` - Credential objects
- ✅ `private_key` / `privatekey` - Private keys

## How It Works

### Automatic Sanitization

All sensitive values are replaced with `[REDACTED]` when logged:

```typescript
const logger = createLogger({ level: LogLevel.ERROR });

// This code:
logger.error('Authentication failed', {
  clientId: 'my-client-id',
  clientSecret: 'super-secret-key',
  accessToken: 'eyJhbGc...',
  user: 'john@example.com'
});

// Produces this output:
// [2025-10-05T12:00:00.000Z] ERROR Authentication failed {"clientId":"[REDACTED]","clientSecret":"[REDACTED]","accessToken":"[REDACTED]","user":"john@example.com"}
```

### Nested Object Sanitization

Sanitization works recursively through nested objects:

```typescript
logger.error('Config error', {
  config: {
    api: {
      credentials: {
        clientId: 'id-123',
        clientSecret: 'secret-456'
      }
    },
    region: 'us'
  }
});

// All nested credential fields are redacted
// region: 'us' remains visible (not sensitive)
```

## Security Best Practices

### ✅ DO

1. **Use the SDK logger** for all logging operations
2. **Pass metadata objects** to logger methods for automatic sanitization
3. **Test credential sanitization** in your application logs
4. **Use environment variables** for credentials in production

```typescript
// ✅ GOOD - Credentials automatically sanitized
import { createLogger, LogLevel } from '@port-experimental/port-sdk';

const logger = createLogger({ level: LogLevel.INFO });
logger.info('User authenticated', { 
  userId: user.id,
  accessToken: token  // Will be redacted
});
```

### ❌ DON'T

1. **Don't interpolate credentials into messages** (bypasses sanitization)
2. **Don't log credentials before SDK initialization**
3. **Don't disable logging without understanding security implications**
4. **Don't use console.log directly** for sensitive operations

```typescript
// ❌ BAD - Credential exposed in message string
logger.error(`Auth failed with token: ${token}`);

// ❌ BAD - Direct console.log bypasses sanitization
console.log('Token:', accessToken);

// ✅ GOOD - Use metadata object
logger.error('Auth failed', { token });
```

## HTTP Client Security

The HTTP client never logs credentials directly:

```typescript
// HTTP client initialization - credentials NOT logged
const client = new HttpClient({
  credentials: {
    clientId: 'id',
    clientSecret: 'secret'  // Never appears in logs
  },
  baseUrl: 'https://api.port.io',  // Safe to log
  timeout: 30000  // Safe to log
});
```

Logs include only non-sensitive metadata:

```
[HttpClient] [2025-10-05T12:00:00.000Z] INFO HTTP client initialized {"baseUrl":"https://api.port.io","timeout":30000,"maxRetries":3,"hasProxy":false}
```

## Testing Credential Security

The SDK includes comprehensive tests to ensure credentials are never exposed:

```typescript
// Test that verifies client ID is redacted
it('should NEVER log Port SDK client ID', () => {
  const logger = createLogger({ level: LogLevel.ERROR });
  logger.error('Auth attempt', {
    clientId: 'port_client_12345',
  });

  const output = console.error.mock.calls[0][0];
  expect(output).toContain('[REDACTED]');
  expect(output).not.toContain('port_client_12345');
});
```

Run security tests:

```bash
# Run all tests including credential sanitization tests
pnpm test tests/unit/logger.test.ts

# Look for tests with "NEVER log" in the name
pnpm test -- --grep "NEVER log"
```

## Monitored Log Levels

Sanitization applies to **all log levels**:

- ✅ `ERROR` - Error messages with credentials
- ✅ `WARN` - Warnings about authentication
- ✅ `INFO` - Informational logs
- ✅ `DEBUG` - Debug output with request details
- ✅ `TRACE` - Verbose tracing information

## Production Recommendations

### 1. Environment Variables

Always use environment variables for credentials:

```bash
export PORT_CLIENT_ID="your-client-id"
export PORT_CLIENT_SECRET="your-client-secret"
```

```typescript
// Credentials loaded from environment, never hardcoded
const client = new PortClient();
```

### 2. Log Level Configuration

Adjust log levels for production:

```typescript
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
  logger: {
    level: LogLevel.WARN,  // Less verbose in production
    enabled: true
  }
});
```

### 3. Log Aggregation

When using log aggregation services (Datadog, Splunk, etc.):

1. ✅ SDK sanitization provides first layer of protection
2. ✅ Configure log aggregation to filter sensitive patterns
3. ✅ Use structured logging (JSON) for better filtering
4. ✅ Regular security audits of logged data

### 4. Error Reporting

When using error reporting services (Sentry, Bugsnag, etc.):

```typescript
// Configure your error reporting to sanitize credentials
Sentry.init({
  beforeSend(event) {
    // Additional sanitization layer
    if (event.extra) {
      for (const key of Object.keys(event.extra)) {
        if (key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('token')) {
          event.extra[key] = '[REDACTED]';
        }
      }
    }
    return event;
  }
});
```

## Compliance

This sanitization system helps meet compliance requirements for:

- **GDPR** - Prevents credential exposure in logs
- **SOC 2** - Demonstrates security controls
- **PCI DSS** - Protects sensitive authentication data
- **HIPAA** - Prevents unauthorized access credentials in logs

## Audit Trail

All credential access is logged (without values):

```typescript
// Logged:
// "Token refresh initiated" (no token value)
// "Authentication successful" (no credentials)
// "OAuth flow completed" (no secrets)

// Never logged:
// Actual token values
// Client secret values
// Password values
```

## Reporting Security Issues

If you discover a credential leak or security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **Contact** security team privately
3. **Include** reproduction steps
4. **Wait** for security fix before public disclosure

## Summary

The Port SDK provides defense-in-depth for credential security:

1. ✅ Automatic sanitization in logger
2. ✅ HTTP client never logs credentials
3. ✅ Comprehensive test coverage
4. ✅ Works with all log levels
5. ✅ Nested object support
6. ✅ Environment variable loading

**Your credentials are safe with Port SDK.**

# Troubleshooting Guide

Common issues and solutions for the Port SDK.

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Network & Connectivity](#network--connectivity)
- [Proxy Configuration](#proxy-configuration)
- [Rate Limiting](#rate-limiting)
- [Type Errors](#type-errors)
- [Entity Operations](#entity-operations)
- [Blueprint Operations](#blueprint-operations)
- [Action Operations](#action-operations)
- [Region Configuration](#region-configuration)
- [Debug Mode](#debug-mode)

---

## Authentication Issues

### Error: `PortAuthError: Authentication failed`

**Cause**: Invalid or missing credentials.

**Solutions**:

1. **Verify credentials**:
   ```typescript
   // Check that your credentials are correct
   const client = new PortClient({
     credentials: {
       clientId: 'YOUR_CLIENT_ID',
       clientSecret: 'YOUR_CLIENT_SECRET'
     }
   });
   ```

2. **Check environment variables**:
   ```bash
   echo $PORT_CLIENT_ID
   echo $PORT_CLIENT_SECRET
   ```

3. **Verify `.env` file** (if using dotenv):
   ```bash
   PORT_CLIENT_ID=your-client-id
   PORT_CLIENT_SECRET=your-client-secret
   ```

4. **Generate new credentials** in your Port account:
   - Go to Settings → Credentials
   - Create new API credentials
   - Replace old credentials

### Error: `PortAuthError: Token refresh failed`

**Cause**: Client credentials have been revoked or expired.

**Solution**: Generate new API credentials in your Port account.

---

## Network & Connectivity

### Error: `PortNetworkError: Network request failed`

**Causes**: Network connectivity issues, DNS resolution failure, or firewall blocking.

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping api.port.io
   # or for US region
   ping api.us.port.io
   ```

2. **Verify Port API accessibility**:
   ```bash
   curl https://api.port.io/v1/health
   ```

3. **Check firewall rules**: Ensure outbound HTTPS (443) is allowed.

4. **Test with different timeout**:
   ```typescript
   const client = new PortClient({
     credentials: { /* ... */ },
     timeout: 30000 // Increase to 30 seconds
   });
   ```

### Error: `PortTimeoutError: Request timeout`

**Cause**: Request took longer than configured timeout.

**Solutions**:

1. **Increase timeout**:
   ```typescript
   const client = new PortClient({
     credentials: { /* ... */ },
     timeout: 60000 // 60 seconds
   });
   ```

2. **Check network latency**: High latency connections may need longer timeouts.

3. **Verify API health**: Port API might be experiencing issues.

---

## Proxy Configuration

### Error: Proxy connection refused

**Cause**: Proxy not accessible or incorrect URL.

**Solutions**:

1. **Verify proxy URL format**:
   ```typescript
   const client = new PortClient({
     credentials: { /* ... */ },
     proxy: {
       url: 'http://proxy.company.com:8080' // Must include protocol
     }
   });
   ```

2. **Test proxy accessibility**:
   ```bash
   curl -x http://proxy.company.com:8080 https://api.port.io/v1/health
   ```

3. **Set environment variables**:
   ```bash
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

### Error: Proxy authentication required

**Solution**: Add proxy credentials:

```typescript
const client = new PortClient({
  credentials: { /* ... */ },
  proxy: {
    url: 'http://proxy.company.com:8080',
    auth: {
      username: 'proxy-user',
      password: 'proxy-pass'
    }
  }
});
```

**Note**: Special characters in passwords are automatically URL-encoded.

### NO_PROXY not working

**Solution**: Ensure correct NO_PROXY format:

```bash
# Correct formats
export NO_PROXY=localhost,127.0.0.1,.internal.com
export NO_PROXY=*.internal.com,10.0.0.0/8
```

---

## Rate Limiting

### Error: `PortRateLimitError: Rate limit exceeded`

**Cause**: Too many requests in a short time period.

**Solutions**:

1. **Check Retry-After header** (SDK does this automatically):
   ```typescript
   try {
     await client.entities.list({ blueprint: 'service' });
   } catch (error) {
     if (error instanceof PortRateLimitError) {
       console.log(`Retry after: ${error.retryAfter} seconds`);
     }
   }
   ```

2. **Implement custom rate limiting**:
   ```typescript
   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
   
   for (const item of items) {
     await client.entities.create(item);
     await delay(100); // 100ms between requests
   }
   ```

3. **Use batch operations** when available:
   ```typescript
   // Instead of multiple creates
   await client.entities.batchCreate([entity1, entity2, entity3]);
   ```

---

## Type Errors

### Error: `Type 'X' is not assignable to type 'Y'`

**Cause**: TypeScript strict type checking.

**Solutions**:

1. **Check required properties**:
   ```typescript
   // ❌ Missing required fields
   const entity = await client.entities.create({
     identifier: 'test'
   });
   
   // ✅ All required fields
   const entity = await client.entities.create({
     identifier: 'test',
     title: 'Test Entity',
     blueprint: 'service'
   });
   ```

2. **Use correct property types**:
   ```typescript
   // For blueprint properties
   const blueprint = await client.blueprints.create({
     identifier: 'my-blueprint',
     title: 'My Blueprint',
     schema: {
       properties: {
         status: {
           type: 'string' as const, // Must be literal type
           enum: ['active', 'inactive']
         }
       }
     }
   });
   ```

3. **Check function signatures**:
   ```typescript
   // ✅ Correct order: identifier, data, optional blueprint
   await client.entities.update('entity-id', { title: 'New Title' }, 'service');
   ```

---

## Entity Operations

### Error: `PortNotFoundError: Entity not found`

**Causes**: Entity doesn't exist or wrong identifier/blueprint.

**Solutions**:

1. **Verify entity exists**:
   ```typescript
   const entities = await client.entities.list({ blueprint: 'service' });
   console.log(entities.data.map(e => e.identifier));
   ```

2. **Check blueprint parameter**:
   ```typescript
   // ✅ Correct: blueprint first, then identifier
   const entity = await client.entities.get('service', 'my-entity-id');
   ```

3. **Search for entity**:
   ```typescript
   const results = await client.entities.search({
     combinator: 'and',
     rules: [{
       property: '$title',
       operator: 'contains',
       value: 'partial-name'
     }]
   });
   ```

### Error: `PortValidationError: Validation failed`

**Cause**: Entity data doesn't match blueprint schema.

**Solutions**:

1. **Check blueprint schema**:
   ```typescript
   const blueprint = await client.blueprints.get('service');
   console.log('Required properties:', blueprint.schema?.required);
   console.log('Properties:', blueprint.schema?.properties);
   ```

2. **Validate property types**:
   ```typescript
   const entity = await client.entities.create({
     identifier: 'test',
     title: 'Test',
     blueprint: 'service',
     properties: {
       stringProps: { name: 'Test' },        // strings
       numberProps: { port: 3000 },          // numbers
       booleanProps: { active: true },       // booleans
       arrayProps: { tags: ['api', 'rest'] } // arrays
     }
   });
   ```

3. **Check relation targets exist**:
   ```typescript
   // Ensure related entities exist before creating relations
   await client.entities.get('_team', 'backend-team'); // Verify team exists
   
   const entity = await client.entities.create({
     identifier: 'test',
     title: 'Test',
     blueprint: 'service',
     relations: {
       singleRelations: { team: 'backend-team' }
     }
   });
   ```

---

## Blueprint Operations

### Error: `PortForbiddenError: Cannot modify system blueprint`

**Cause**: Trying to modify built-in blueprints (starting with `_`).

**Solution**: System blueprints (`_user`, `_team`, `_scorecard`, etc.) cannot be modified. Create custom blueprints instead:

```typescript
const blueprint = await client.blueprints.create({
  identifier: 'my_custom_blueprint', // Don't start with _
  title: 'My Custom Blueprint',
  schema: { properties: {} }
});
```

### Error: Blueprint property type change rejected

**Cause**: Changing property types on existing blueprints.

**Solution**: Port prevents breaking changes. Options:

1. **Create new property** with different name
2. **Delete and recreate blueprint** (loses all entities!)
3. **Migrate data** to new blueprint

---

## Action Operations

### Error: `PortValidationError: Invalid invocation method`

**Cause**: Incorrect action configuration.

**Solution**: Use correct type literals:

```typescript
const action = await client.actions.create({
  identifier: 'my-action',
  title: 'My Action',
  blueprint: 'service',
  trigger: 'DAY-2' as const, // Must be literal type
  invocationMethod: {
    type: 'WEBHOOK' as const, // Uppercase, literal type
    url: 'https://example.com/webhook',
    agent: false
  }
});
```

---

## Region Configuration

### Error: Connecting to wrong region

**Symptoms**: 404 errors for resources that exist in your account.

**Solution**: Specify correct region:

```typescript
// For US region
const client = new PortClient({
  credentials: { /* ... */ },
  region: 'us'
});

// Or set environment variable
// PORT_REGION=us
```

**Check your region**:
- EU: `https://app.getport.io`
- US: `https://app.us.getport.io`

---

## Debug Mode

### Enable verbose logging

```typescript
import { PortClient, LogLevel } from '@port-labs/port-sdk';

const client = new PortClient({
  credentials: { /* ... */ },
  logger: {
    level: LogLevel.DEBUG, // or LogLevel.TRACE for even more detail
    enabled: true
  }
});
```

### Environment variable logging

```bash
# Set log level
export PORT_LOG_LEVEL=debug

# Enable logging
export PORT_LOG_ENABLED=true

# Run your script
node my-script.js
```

### What gets logged

- `ERROR`: Only errors
- `WARN`: Warnings and errors  
- `INFO`: General information (default)
- `DEBUG`: Detailed debugging information
- `TRACE`: Very detailed trace logs (includes request/response bodies)

---

## Getting Help

If you're still experiencing issues:

1. **Check GitHub Issues**: [github.com/port-labs/port-js-sdk/issues](https://github.com/port-labs/port-js-sdk/issues)
2. **Review Examples**: Check the `examples/` directory
3. **Run Smoke Tests**: Use `pnpm smoke` to verify SDK functionality
4. **Enable Debug Logging**: Set `LogLevel.DEBUG` to see detailed information
5. **Contact Support**: Open an issue or contact Port support

---

## Common Patterns

### Retry on specific errors

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof PortRateLimitError && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const entity = await retryOperation(() =>
  client.entities.get('service', 'my-entity')
);
```

### Batch operations with error handling

```typescript
const results = await Promise.allSettled(
  entities.map(e => client.entities.create(e))
);

const succeeded = results.filter(r => r.status === 'fulfilled');
const failed = results.filter(r => r.status === 'rejected');

console.log(`Created: ${succeeded.length}, Failed: ${failed.length}`);

// Handle failures
for (const failure of failed) {
  if (failure.status === 'rejected') {
    console.error('Error:', failure.reason);
  }
}
```

### Safe entity cleanup

```typescript
async function safeDelete(blueprint: string, identifier: string) {
  try {
    await client.entities.delete(blueprint, identifier);
    console.log(`Deleted: ${identifier}`);
  } catch (error) {
    if (error instanceof PortNotFoundError) {
      console.log(`Already deleted: ${identifier}`);
    } else {
      throw error;
    }
  }
}
```


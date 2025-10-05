# Running Examples

Complete guide to running and understanding Port SDK examples.

## 🚀 Quick Start

### 1. Setup Credentials

First, create a `.env` file in the project root:

```bash
# Copy the example file
cp examples/.env.example examples/.env

# Or create manually
cat > examples/.env << EOF
PORT_CLIENT_ID=your_client_id_here
PORT_CLIENT_SECRET=your_client_secret_here
EOF
```

Get your credentials from [Port Settings](https://app.getport.io/settings).

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run an Example

```bash
# Basic usage - initialize SDK
pnpm tsx examples/01-basic-usage.ts

# Entity operations
pnpm tsx examples/04-entities-crud.ts
pnpm tsx examples/05-entities-search.ts
pnpm tsx examples/06-entities-batch.ts
```

## 📋 Command Reference

### Running Examples

**Basic Syntax:**
```bash
pnpm tsx examples/<filename>.ts
```

## 🔗 Entity Relations Examples (NEW!)

**Essential concepts for building connected data models:**

```bash
# Basic relations (start here!)
pnpm tsx examples/20-entity-relations-basic.ts

# Bidirectional relations (CRITICAL to understand!)
pnpm tsx examples/21-bidirectional-relations.ts

# Complex dependency graphs
pnpm tsx examples/22-complex-relations.ts
```

**With Inline Credentials:**
```bash
PORT_CLIENT_ID=xxx PORT_CLIENT_SECRET=yyy pnpm tsx examples/01-basic-usage.ts
```

**With Custom Region:**
```bash
PORT_REGION=us pnpm tsx examples/01-basic-usage.ts
```

**With Verbose Logging:**
```bash
PORT_VERBOSE=true pnpm tsx examples/04-entities-crud.ts
# or
PORT_LOG_LEVEL=debug pnpm tsx examples/04-entities-crud.ts
```

**With Proxy:**
```bash
HTTP_PROXY=http://proxy.corp.com:8080 pnpm tsx examples/01-basic-usage.ts
```

## 📚 Available Examples

### Getting Started

#### `01-basic-usage.ts` - Initialize SDK
```bash
pnpm tsx examples/01-basic-usage.ts
```
**What it does:**
- Initialize Port SDK client
- Show available resources
- Verify authentication

**Duration:** ~1 second

---

### Entity Operations

#### `04-entities-crud.ts` - CRUD Operations
```bash
pnpm tsx examples/04-entities-crud.ts
```
**What it does:**
- Create a test entity
- Read it back
- Update its properties
- Delete it
- Verify deletion

**Duration:** ~5 seconds  
**Prerequisites:** `service` blueprint must exist

---

#### `05-entities-search.ts` - Search & Filter
```bash
pnpm tsx examples/05-entities-search.ts
```
**What it does:**
- Create sample entities
- List all entities
- Search by environment
- Complex multi-condition queries
- Text search
- Comparison operators
- Cleanup

**Duration:** ~10 seconds  
**Prerequisites:** `service` blueprint must exist

---

#### `06-entities-batch.ts` - Batch Operations
```bash
pnpm tsx examples/06-entities-batch.ts
```
**What it does:**
- Batch create 5 entities
- Batch update all
- Batch delete all
- Show performance metrics

**Duration:** ~8 seconds  
**Prerequisites:** `service` blueprint must exist

---

## 🔧 Troubleshooting

### Common Issues

#### "Missing credentials" Error

**Error:**
```
❌ Missing credentials
Set PORT_CLIENT_ID and PORT_CLIENT_SECRET
```

**Solution:**
```bash
# Create .env file in examples directory
cp examples/.env.example examples/.env

# Edit and add your credentials
vim examples/.env
```

---

#### "Blueprint not found" Error

**Error:**
```
PortNotFoundError: Blueprint with identifier "service" not found
```

**Solution:**
- Ensure you have a `service` blueprint in your Port instance
- Or modify the example to use a blueprint that exists
- Check available blueprints at https://app.getport.io/settings/data-model

---

#### Authentication Errors

**Error:**
```
PortAuthError: Authentication failed
```

**Solutions:**
1. Verify credentials are correct
2. Check if credentials are expired
3. Ensure no trailing spaces in credentials
4. Try generating new credentials

```bash
# Test credentials
PORT_CLIENT_ID=xxx PORT_CLIENT_SECRET=yyy pnpm tsx examples/01-basic-usage.ts
```

---

#### Network/Proxy Issues

**Error:**
```
PortNetworkError: fetch failed
```

**Solution:**
```bash
# If behind corporate proxy
HTTP_PROXY=http://proxy.corp.com:8080 pnpm tsx examples/01-basic-usage.ts

# With proxy authentication
PROXY_AUTH_USERNAME=user PROXY_AUTH_PASSWORD=pass HTTP_PROXY=http://proxy:8080 pnpm tsx examples/01-basic-usage.ts
```

---

## 💡 Tips & Best Practices

### Environment Variables

Create a `.env` file for persistent configuration:

```bash
# examples/.env
PORT_CLIENT_ID=your_client_id
PORT_CLIENT_SECRET=your_client_secret
PORT_REGION=eu
PORT_LOG_LEVEL=info
PORT_VERBOSE=false

# Optional: Proxy settings
HTTP_PROXY=http://proxy.corp.com:8080
HTTPS_PROXY=http://proxy.corp.com:8080
NO_PROXY=localhost,127.0.0.1
```

### Enable Debug Logging

See detailed API requests and responses:

```bash
PORT_LOG_LEVEL=debug pnpm tsx examples/04-entities-crud.ts
```

Or in code:
```typescript
const client = new PortClient({
  credentials: { /* ... */ },
  logger: {
    level: 'debug',
    enabled: true,
  },
});
```

### Running Multiple Examples

```bash
# Run all entity examples in sequence
pnpm tsx examples/01-basic-usage.ts && \
pnpm tsx examples/04-entities-crud.ts && \
pnpm tsx examples/05-entities-search.ts && \
pnpm tsx examples/06-entities-batch.ts
```

### Testing Against Different Regions

```bash
# EU region (default)
pnpm tsx examples/01-basic-usage.ts

# US region
PORT_REGION=us pnpm tsx examples/01-basic-usage.ts
```

### Custom Base URL

```bash
# For self-hosted or custom Port instances
PORT_BASE_URL=https://custom.port.io pnpm tsx examples/01-basic-usage.ts
```

---

## 🧪 Modifying Examples

All examples are TypeScript files you can modify:

1. **Copy an example:**
   ```bash
   cp examples/04-entities-crud.ts examples/my-custom-example.ts
   ```

2. **Modify it:**
   ```typescript
   // Change blueprint, properties, etc.
   const entity = await client.entities.create({
     identifier: 'my-custom-service',
     blueprint: 'my-blueprint',
     // ...
   });
   ```

3. **Run it:**
   ```bash
   pnpm tsx examples/my-custom-example.ts
   ```

---

## 📖 Example Patterns

### Pattern: Create and Cleanup

```typescript
const identifier = `test-${Date.now()}`;

try {
  // Your operations
  const entity = await client.entities.create({
    identifier,
    blueprint: 'service',
    title: 'Test',
  });
  
  // ... do something ...
  
} catch (error) {
  console.error('Error:', error);
} finally {
  // Always cleanup
  try {
    await client.entities.delete(identifier);
  } catch {
    // Ignore cleanup errors
  }
}
```

### Pattern: Batch with Error Handling

```typescript
const identifiers: string[] = [];

try {
  const entities = await client.entities.batchCreate([...]);
  identifiers.push(...entities.map(e => e.identifier));
  
  // ... operations ...
  
} finally {
  // Cleanup all created entities
  if (identifiers.length > 0) {
    await client.entities.batchDelete(identifiers);
  }
}
```

### Pattern: Search with Pagination

```typescript
let offset = 0;
const limit = 50;
let hasMore = true;

while (hasMore) {
  const result = await client.entities.list({ offset, limit });
  
  // Process result.data
  
  offset += limit;
  hasMore = result.pagination.hasMore;
}
```

---

## 🔗 Next Steps

- **[Examples README](../examples/README.md)** - Full examples index
- **[API Documentation](https://docs.getport.io/api-reference)** - Port API reference
- **[SDK Documentation](../README.md)** - Main SDK documentation
- **[Contributing Guide](../CONTRIBUTING.md)** - Submit your own examples

---

## 📝 Example Template

Use this template for creating new examples:

```typescript
/**
 * Example: [Clear Title]
 * 
 * Description: [What this demonstrates]
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env
 * - [Any other requirements]
 * 
 * Usage:
 *   pnpm tsx examples/[filename].ts
 * 
 * Expected output:
 *   [What the user should see]
 */

import { PortClient } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Validate credentials
  if (!process.env.PORT_CLIENT_ID || !process.env.PORT_CLIENT_SECRET) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  console.log('🚀 Example Title\n');
  console.log('='.repeat(60));

  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID,
      clientSecret: process.env.PORT_CLIENT_SECRET,
    },
  });

  try {
    // Your example code here
    
    console.log('\n✅ Success!');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
```

---

**Questions?** Open an issue or check the [FAQ](./FAQ.md).


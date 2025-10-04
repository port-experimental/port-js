# Examples Development Guide

Guidelines for creating high-quality examples for the Port SDK.

## Example Structure

Every example should follow this template:

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
  // 1. Validate credentials
  if (!process.env.PORT_CLIENT_ID || !process.env.PORT_CLIENT_SECRET) {
    console.error('❌ Missing credentials');
    console.error('Set PORT_CLIENT_ID and PORT_CLIENT_SECRET');
    process.exit(1);
  }

  // 2. Initialize client
  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID,
      clientSecret: process.env.PORT_CLIENT_SECRET,
    },
  });

  try {
    console.log('📝 Starting example...\n');
    
    // 3. Example code with clear steps
    
    console.log('\n✅ Success!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
```

## Security Rules

### Never Include Credentials

❌ **Never**:
```typescript
const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',        // NO!
    clientSecret: 'your-secret',       // NO!
  },
});
```

✅ **Always**:
```typescript
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});
```

### Validate Environment

```typescript
if (!process.env.PORT_CLIENT_ID || !process.env.PORT_CLIENT_SECRET) {
  console.error('❌ Missing credentials');
  console.error('Set PORT_CLIENT_ID and PORT_CLIENT_SECRET');
  process.exit(1);
}
```

## Documentation Standards

### Clear Comments

```typescript
// ✅ GOOD - Explains WHY
// Filter to production services with high severity vulnerabilities
const services = await client.entities.search({
  blueprint: 'service',
  rules: [
    { property: 'environment', operator: '=', value: 'production' },
    { property: 'severity', operator: '>=', value: 'high' },
  ],
});

// ❌ BAD - Explains WHAT (already obvious)
// Search entities
const services = await client.entities.search({...});
```

### Step-by-Step Output

```typescript
console.log('Step 1: Creating blueprint...');
const blueprint = await client.blueprints.create({...});
console.log('✓ Blueprint created:', blueprint.identifier);

console.log('\nStep 2: Creating entity...');
const entity = await client.entities.create({...});
console.log('✓ Entity created:', entity.identifier);
```

## Example Categories

### 1. Getting Started

- `01-basic-usage.ts` - Client initialization
- `02-authentication.ts` - Auth methods
- `03-configuration.ts` - Configuration options

### 2. Core Features

- `04-entities-crud.ts` - Entity CRUD
- `05-entities-search.ts` - Search & filter
- `06-entities-batch.ts` - Batch operations
- `08-blueprints-crud.ts` - Blueprint CRUD
- `11-actions-crud.ts` - Action CRUD
- `14-scorecards-crud.ts` - Scorecard CRUD

### 3. Advanced

- `16-error-handling.ts` - Error scenarios
- `17-logging-debug.ts` - Debugging
- `19-proxy-config.ts` - Proxy setup
- `advanced/service-catalog.ts` - Full app example

## Quality Checklist

Before committing:

- [ ] Runs without errors
- [ ] No hardcoded credentials
- [ ] Uses environment variables
- [ ] Has clear comments
- [ ] Shows expected output
- [ ] Handles errors gracefully
- [ ] Includes prerequisites
- [ ] Has usage instructions
- [ ] Follows naming convention
- [ ] Cleans up resources
- [ ] Works cross-platform

## Running Examples

### Single Example

```bash
pnpm tsx examples/01-basic-usage.ts
```

### With Explicit Credentials

```bash
PORT_CLIENT_ID=xxx PORT_CLIENT_SECRET=yyy pnpm tsx examples/01-basic-usage.ts
```

### All Examples

```bash
pnpm run examples:validate
```

## File Naming

```
examples/
├── 01-basic-usage.ts          # Number prefix for ordering
├── 02-authentication.ts        # Clear, descriptive names
├── 03-configuration.ts         # Use hyphens, not underscores
└── advanced/                   # Group advanced examples
    ├── service-catalog.ts
    └── security-dashboard.ts
```

## See Also

- [Testing Guide](../TESTING.md)
- [Security Guidelines](./SECURITY_GUIDELINES.md)
- [Examples README](../../examples/README.md)


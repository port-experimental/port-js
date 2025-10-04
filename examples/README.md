# Port SDK Examples

This directory contains practical examples demonstrating how to use the Port SDK.

## 🚀 Quick Start

### 1. Setup Credentials

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Port credentials
# Get credentials from: https://app.getport.io/settings
```

### 2. Run an Example

```bash
# Use convenient npm scripts
pnpm example:basic       # Getting started
pnpm example:crud        # Entity CRUD operations
pnpm example:search      # Search and filter
pnpm example:batch       # Batch operations

# Or run directly with tsx
pnpm tsx examples/01-basic-usage.ts
pnpm tsx examples/04-entities-crud.ts

# Or with explicit credentials
PORT_CLIENT_ID=xxx PORT_CLIENT_SECRET=yyy pnpm tsx examples/01-basic-usage.ts
```

## 📚 Available Examples

### Getting Started

- ✅ **`01-basic-usage.ts`** - Initialize client and basic operations
- 🚧 **`02-authentication.ts`** - Different authentication methods
- 🚧 **`03-configuration.ts`** - Configuration options (region, proxy, logging)

### Entities

- ✅ **`04-entities-crud.ts`** - Create, read, update, delete entities
- ✅ **`05-entities-search.ts`** - Search and filter entities
- ✅ **`06-entities-batch.ts`** - Batch operations for efficiency
- 🚧 **`07-entities-relations.ts`** - Working with entity relations

### Blueprints

- 🚧 **`08-blueprints-crud.ts`** - Manage blueprint schemas
- 🚧 **`09-blueprints-properties.ts`** - Define properties and types
- 🚧 **`10-blueprints-relations.ts`** - Configure blueprint relations

### Actions

- 🚧 **`11-actions-crud.ts`** - Create and manage actions
- **`12-actions-execute.ts`** - Execute actions and monitor runs
- **`13-actions-webhooks.ts`** - Webhook-based actions

### Scorecards

- 🚧 **`14-scorecards-crud.ts`** - Manage scorecards
- 🚧 **`15-scorecards-rules.ts`** - Define scorecard rules and levels

### Error Handling & Debugging

- 🚧 **`16-error-handling.ts`** - Handle different error types
- 🚧 **`17-logging-debug.ts`** - Enable logging for debugging
- 🚧 **`18-retry-logic.ts`** - Understanding retry behavior

### Advanced Usage

- 🚧 **`19-proxy-config.ts`** - Configure proxy for corporate networks
- 🚧 **`20-rate-limiting.ts`** - Handle rate limits gracefully
- 🚧 **`advanced/service-catalog.ts`** - Build a service catalog
- 🚧 **`advanced/security-dashboard.ts`** - Security posture dashboard
- 🚧 **`advanced/automated-workflows.ts`** - Automated compliance workflows

## 🔒 Security Note

**NEVER commit your `.env` file!** It's already in `.gitignore`.

All examples use environment variables for credentials:
```typescript
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});
```

## 🧪 Testing Examples

All examples are validated in CI/CD to ensure they work correctly:

```bash
# Validate all examples (requires credentials)
pnpm run examples:validate

# Run specific example
pnpm tsx examples/01-basic-usage.ts
```

## 📖 Example Structure

Each example follows this structure:

```typescript
/**
 * Example: Clear Title
 * 
 * Description: What this example demonstrates
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET
 * - Any other requirements
 * 
 * Usage:
 *   pnpm tsx examples/filename.ts
 */

import { PortClient } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // 1. Validate credentials
  if (!process.env.PORT_CLIENT_ID) {
    console.error('Missing PORT_CLIENT_ID');
    process.exit(1);
  }

  // 2. Initialize client
  const client = new PortClient({...});

  try {
    // 3. Example code
    console.log('📝 Starting example...');
    
    // Your code here
    
    console.log('✅ Success!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
```

## 🤝 Contributing

Want to add an example?

1. Follow the structure above
2. Use environment variables for credentials
3. Add clear comments explaining each step
4. Show expected output
5. Handle errors gracefully
6. Test it works!
7. Submit a PR

See [Examples Guide](../docs/development/EXAMPLES_GUIDE.md) for detailed guidelines.

## 💡 Tips

### Enable Verbose Logging

```bash
PORT_VERBOSE=true pnpm tsx examples/01-basic-usage.ts
```

### Use Different Regions

```bash
PORT_REGION=us pnpm tsx examples/01-basic-usage.ts
```

### Test with Proxy

```bash
HTTP_PROXY=http://localhost:8080 pnpm tsx examples/19-proxy-config.ts
```

## 🆘 Getting Help

- 📖 [Main README](../README.md)
- 📚 [API Documentation](https://docs.getport.io)
- 💬 [Community Slack](https://www.getport.io/community)
- 🐛 [Report Issues](https://github.com/port-labs/port-sdk/issues)

## 📝 Example Index

| Example | Topic | Difficulty |
|---------|-------|------------|
| 01-basic-usage | Getting Started | ⭐ Beginner |
| 02-authentication | Auth Methods | ⭐ Beginner |
| 03-configuration | SDK Config | ⭐ Beginner |
| 04-entities-crud | Entity CRUD | ⭐⭐ Intermediate |
| 05-entities-search | Entity Search | ⭐⭐ Intermediate |
| 06-entities-batch | Batch Operations | ⭐⭐ Intermediate |
| 07-entities-relations | Entity Relations | ⭐⭐ Intermediate |
| 08-blueprints-crud | Blueprint CRUD | ⭐⭐ Intermediate |
| 09-blueprints-properties | Blueprint Props | ⭐⭐⭐ Advanced |
| 10-blueprints-relations | Blueprint Relations | ⭐⭐⭐ Advanced |
| 11-actions-crud | Action CRUD | ⭐⭐ Intermediate |
| 12-actions-execute | Action Execution | ⭐⭐ Intermediate |
| 13-actions-webhooks | Webhook Actions | ⭐⭐⭐ Advanced |
| 14-scorecards-crud | Scorecard CRUD | ⭐⭐ Intermediate |
| 15-scorecards-rules | Scorecard Rules | ⭐⭐⭐ Advanced |
| 16-error-handling | Error Handling | ⭐⭐ Intermediate |
| 17-logging-debug | Debugging | ⭐⭐ Intermediate |
| 18-retry-logic | Retry Patterns | ⭐⭐ Intermediate |
| 19-proxy-config | Proxy Setup | ⭐⭐ Intermediate |
| 20-rate-limiting | Rate Limits | ⭐⭐⭐ Advanced |
| advanced/service-catalog | Full App | ⭐⭐⭐⭐ Expert |
| advanced/security-dashboard | Full App | ⭐⭐⭐⭐ Expert |
| advanced/automated-workflows | Full App | ⭐⭐⭐⭐ Expert |

---

Happy coding! 🚀
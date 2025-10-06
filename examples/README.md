# Port SDK Examples

Complete, runnable examples demonstrating all features of the Port SDK.

## 📋 Table of Contents

### 🚀 Getting Started
- [01 - Basic Usage](./01-basic-usage.ts) - Initialize client and make your first API call
- [02 - Authentication](./02-authentication.ts) - Different authentication methods
- [03 - Configuration](./03-configuration.ts) - All configuration options

### 📦 Working with Entities
- [04 - Entity CRUD](./04-entities-crud.ts) - Create, read, update, delete entities
- [05 - Entity Search](./05-entities-search.ts) - Search and filter entities
- [06 - Entity Batch Operations](./06-entities-batch.ts) - Bulk create/update/delete
- [07 - Entity Relations](./07-entities-relations.ts) - Working with entity relationships

### 🏗️ Working with Blueprints
- [08 - Blueprint CRUD](./08-blueprints-crud.ts) - Manage blueprint lifecycle

### ⚡ Working with Actions
- [11 - Action CRUD](./11-actions-crud.ts) - Create and manage actions

### 📊 Working with Scorecards
- [13 - Scorecard CRUD](./13-scorecards-crud.ts) - Manage scorecards

### 🛠️ Advanced Features
- [15 - Error Handling](./15-error-handling.ts) - Comprehensive error handling patterns
- [16 - Logging & Debugging](./16-logging-debugging.ts) - Enable detailed logging
- [17 - Proxy Configuration](./17-proxy-config.ts) - Use corporate proxies

### 🪝 Working with Webhooks
- [23 - Webhook CRUD](./23-webhooks-crud.ts) - Create and manage webhooks

### 📋 Monitoring & Auditing
- [24 - Audit Logs](./24-audit-logs.ts) - Query and filter audit logs
- [25 - Action Runs](./25-action-runs.ts) - Monitor action execution runs

### 🎯 Complete Workflow
- [18 - End-to-End](./18-end-to-end.ts) - Complete Port.io setup from scratch

## 🏃 Running Examples

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure credentials**:
   ```bash
   # Copy the example env file
   cp examples/.env.example examples/.env
   
   # Edit with your credentials
   nano examples/.env
   ```

3. **Add your credentials**:
   ```bash
   PORT_CLIENT_ID=your_client_id_here
   PORT_CLIENT_SECRET=your_client_secret_here
   PORT_REGION=eu  # or 'us'
   ```

### Run Individual Examples

```bash
# Getting started examples
pnpm tsx examples/01-basic-usage.ts
pnpm tsx examples/02-authentication.ts
pnpm tsx examples/03-configuration.ts

# Entity examples
pnpm tsx examples/04-entities-crud.ts
pnpm tsx examples/05-entities-search.ts
pnpm tsx examples/06-entities-batch.ts
pnpm tsx examples/07-entities-relations.ts

# Blueprint, action, and scorecard examples
pnpm tsx examples/08-blueprints-crud.ts
pnpm tsx examples/11-actions-crud.ts
pnpm tsx examples/13-scorecards-crud.ts

# Advanced examples
pnpm tsx examples/15-error-handling.ts
pnpm tsx examples/16-logging-debugging.ts
pnpm tsx examples/17-proxy-config.ts

# Webhook examples
pnpm tsx examples/23-webhooks-crud.ts

# Monitoring and auditing
pnpm tsx examples/24-audit-logs.ts
pnpm tsx examples/25-action-runs.ts

# Complete workflow
pnpm tsx examples/18-end-to-end.ts
```

## 📚 Example Structure

Each example follows a consistent structure:

```typescript
/**
 * Example: [Title]
 * 
 * Description: [What this example demonstrates]
 * 
 * Prerequisites:
 * - [Required setup]
 * 
 * Run:
 * pnpm tsx examples/XX-example-name.ts
 */

import { PortClient } from '../src';

async function main() {
  // 1. Setup
  const client = new PortClient({
    // Configuration
  });

  // 2. Demonstrate features
  console.log('Step 1: ...');
  // Code here

  console.log('Step 2: ...');
  // Code here

  // 3. Cleanup (if needed)
  console.log('Cleaning up...');
  // Cleanup code
}

// Run with error handling
main().catch(console.error);
```

## 🎓 Learning Path

### Beginner

Start with these examples to understand the basics:

1. **01 - Basic Usage** - Get familiar with the SDK
2. **02 - Authentication** - Learn authentication methods
3. **04 - Entity CRUD** - Work with entities
4. **08 - Blueprint CRUD** - Manage blueprints

### Intermediate

Once comfortable with basics, explore:

5. **05 - Entity Search** - Advanced querying
6. **06 - Entity Batch Operations** - Bulk operations
7. **07 - Entity Relations** - Connect entities
8. **11 - Actions CRUD** - Create and manage actions
9. **13 - Scorecards CRUD** - Quality tracking
10. **15 - Error Handling** - Robust error handling

### Advanced

For production-ready applications:

11. **16 - Logging & Debugging** - Troubleshooting
12. **17 - Proxy Configuration** - Corporate networks
13. **18 - End-to-End** - Complete workflow

## 💡 Tips for Using Examples

### 1. Start Simple
Begin with `01-basic-usage.ts` to ensure your setup works before trying complex examples.

### 2. Use TypeScript
Run examples with `tsx` for the best experience:
```bash
pnpm tsx examples/01-basic-usage.ts
```

### 3. Enable Logging
Add `PORT_LOG_LEVEL=debug` to see what's happening:
```bash
PORT_LOG_LEVEL=debug pnpm tsx examples/01-basic-usage.ts
```

### 4. Modify Examples
Copy any example and modify it for your use case:
```bash
cp examples/04-entities-crud.ts my-custom-example.ts
# Edit my-custom-example.ts
pnpm tsx my-custom-example.ts
```

### 5. Clean Up Resources
Most examples clean up after themselves. If interrupted, you may need to manually delete test resources from the Port dashboard.

## 🔧 Troubleshooting

### "Cannot find module"
```bash
# Install dependencies
pnpm install

# Try from project root
cd /path/to/port-js
pnpm tsx examples/01-basic-usage.ts
```

### "Authentication failed"
```bash
# Check your .env file exists
ls -la examples/.env

# Verify credentials are correct
cat examples/.env

# Ensure PORT_CLIENT_ID and PORT_CLIENT_SECRET are set
```

### "Entity already exists"
Examples use timestamps to create unique IDs. If you run examples very quickly in succession, you might hit conflicts. Wait a second and try again.

### Examples are slow
This is normal - examples make real API calls. You can:
- Use a closer region (EU or US)
- Reduce the number of operations
- Enable logging to see progress

## 📖 Additional Resources

- [API Documentation](../docs/api/) - Detailed API reference
- [Testing Guide](../docs/TESTING.md) - Write tests for your code
- [Contributing Guide](../CONTRIBUTING.md) - Contribute examples
- [Port Documentation](https://docs.port.io) - Official Port docs

## 🤝 Contributing Examples

Have a great example? We'd love to include it!

1. Follow the example structure above
2. Include clear comments
3. Add error handling
4. Clean up resources
5. Update this README
6. Submit a pull request

## 📝 Example Checklist

When creating an example, ensure:

- [ ] Clear title and description
- [ ] Prerequisites listed
- [ ] Run command included
- [ ] Step-by-step comments
- [ ] Error handling
- [ ] Resource cleanup
- [ ] Timestamps in identifiers
- [ ] Console output for progress
- [ ] Works from project root
- [ ] Added to this README

## ⚠️ Important Notes

### Test Environment
- Examples create real resources in your Port workspace
- Always use a development/test workspace
- Never run examples against production

### API Rate Limits
- Examples respect rate limits
- Don't run too many examples simultaneously
- If you hit rate limits, wait a few minutes

### Cleanup
- Examples clean up after themselves
- If interrupted, manually delete test resources
- Look for resources with `example_` prefix

## 🆘 Getting Help

Need help with examples?

- Check the [FAQ](../docs/FAQ.md)
- Open an [issue](https://github.com/port-labs/port-js/issues)
- Join [Port Community](https://port.io/community)
- Email: support@getport.io

---

**Happy coding!** 🚀

# Quick Start Guide

Get up and running with the Port SDK in minutes!

## 5-Minute Quick Start

### 1. Install the SDK

```bash
pnpm add @port-labs/port-sdk
```

### 2. Set Up Credentials

```bash
# Create .env file
echo "PORT_CLIENT_ID=your_client_id" > .env
echo "PORT_CLIENT_SECRET=your_client_secret" >> .env
```

### 3. Write Your First Script

```typescript
// index.ts
import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});

// List all blueprints
const blueprints = await client.blueprints.list();
console.log(`Found ${blueprints.data.length} blueprints`);

// Create a new entity
const entity = await client.entities.create({
  identifier: 'my-first-service',
  blueprint: 'service',
  title: 'My First Service',
  properties: {
    stringProps: {
      environment: 'development',
    },
  },
});

console.log(`Created entity: ${entity.identifier}`);
```

### 4. Run It!

```bash
npx tsx index.ts
```

## Common Tasks

### List Resources

```typescript
// List blueprints
const blueprints = await client.blueprints.list();

// List entities from a blueprint
const entities = await client.entities.list('service');

// List with pagination
const page1 = await client.entities.list('service', { 
  limit: 10, 
  offset: 0 
});
```

### Create Resources

```typescript
// Create a blueprint
const blueprint = await client.blueprints.create({
  identifier: 'microservice',
  title: 'Microservice',
  icon: 'Service',
  schema: {
    properties: {
      name: {
        type: 'string',
        title: 'Name',
      },
      version: {
        type: 'string',
        title: 'Version',
      },
    },
    required: ['name'],
  },
});

// Create an entity
const entity = await client.entities.create({
  identifier: 'user-service',
  blueprint: 'microservice',
  title: 'User Service',
  properties: {
    stringProps: {
      name: 'User Service',
      version: 'v1.0.0',
    },
  },
});
```

### Search and Filter

```typescript
// Search entities
const results = await client.entities.search({
  combinator: 'and',
  rules: [
    {
      property: '$blueprint',
      operator: '=',
      value: 'service',
    },
    {
      property: 'environment',
      operator: '=',
      value: 'production',
    },
  ],
});

console.log(`Found ${results.length} production services`);
```

### Update Resources

```typescript
// Update a blueprint
await client.blueprints.update('microservice', {
  title: 'Updated Microservice',
  description: 'A microservice blueprint',
});

// Update an entity
await client.entities.update('user-service', 'microservice', {
  title: 'Updated User Service',
  properties: {
    stringProps: {
      version: 'v1.1.0',
    },
  },
});
```

### Delete Resources

```typescript
// Delete an entity
await client.entities.delete('user-service', 'microservice');

// Delete a blueprint
await client.blueprints.delete('microservice');
```

## Error Handling

```typescript
import { PortNotFoundError, PortAuthError } from '@port-labs/port-sdk';

try {
  const entity = await client.entities.get('unknown-id', 'service');
} catch (error) {
  if (error instanceof PortNotFoundError) {
    console.log('Entity not found');
  } else if (error instanceof PortAuthError) {
    console.log('Authentication failed');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Working with Relations

```typescript
// Create entities with relations
const service = await client.entities.create({
  identifier: 'api-service',
  blueprint: 'service',
  title: 'API Service',
  relations: {
    singleRelations: {
      team: 'backend-team',
    },
    manyRelations: {
      dependencies: ['database', 'cache'],
    },
  },
});

// Get related entities
const dependencies = await client.entities.getRelated(
  'api-service',
  'dependencies',
  'service'
);
```

## Environment-Specific Configuration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
  logger: {
    enabled: isDevelopment,
    level: isDevelopment ? 3 : 1, // DEBUG in dev, WARN in prod
  },
  timeout: isDevelopment ? 30000 : 10000,
});
```

## Next Steps

Now that you have the basics, explore:

- [API Reference](../api/) - Detailed API documentation
- [Examples](../EXAMPLES.md) - More comprehensive examples
- [Error Handling Guide](../guides/error-handling.md) - Handle errors like a pro
- [Configuration Guide](./configuration.md) - All configuration options

## Complete Example

Here's a complete example that demonstrates common operations:

```typescript
import { PortClient, PortNotFoundError } from '@port-labs/port-sdk';

async function main() {
  // Initialize client
  const client = new PortClient({
    credentials: {
      clientId: process.env.PORT_CLIENT_ID!,
      clientSecret: process.env.PORT_CLIENT_SECRET!,
    },
    logger: {
      enabled: true,
      level: 2, // INFO
    },
  });

  console.log('🚀 Starting Port SDK demo...\n');

  // 1. List existing blueprints
  console.log('📋 Listing blueprints...');
  const blueprints = await client.blueprints.list();
  console.log(`Found ${blueprints.data.length} blueprints\n`);

  // 2. Create a test blueprint
  console.log('🏗️  Creating test blueprint...');
  const blueprint = await client.blueprints.create({
    identifier: 'demo-service',
    title: 'Demo Service',
    icon: 'Service',
    schema: {
      properties: {
        name: { type: 'string', title: 'Name' },
        status: { 
          type: 'string', 
          title: 'Status',
          enum: ['active', 'inactive'],
        },
      },
      required: ['name'],
    },
  });
  console.log(`Created blueprint: ${blueprint.identifier}\n`);

  // 3. Create entities
  console.log('📦 Creating entities...');
  const entity1 = await client.entities.create({
    identifier: 'demo-service-1',
    blueprint: 'demo-service',
    title: 'Demo Service 1',
    properties: {
      stringProps: {
        name: 'First Service',
        status: 'active',
      },
    },
  });
  console.log(`Created entity: ${entity1.identifier}`);

  const entity2 = await client.entities.create({
    identifier: 'demo-service-2',
    blueprint: 'demo-service',
    title: 'Demo Service 2',
    properties: {
      stringProps: {
        name: 'Second Service',
        status: 'inactive',
      },
    },
  });
  console.log(`Created entity: ${entity2.identifier}\n`);

  // 4. Search entities
  console.log('🔍 Searching active services...');
  const activeServices = await client.entities.search({
    combinator: 'and',
    rules: [
      { property: '$blueprint', operator: '=', value: 'demo-service' },
      { property: 'status', operator: '=', value: 'active' },
    ],
  });
  console.log(`Found ${activeServices.length} active services\n`);

  // 5. Update an entity
  console.log('✏️  Updating entity...');
  const updated = await client.entities.update(
    'demo-service-2',
    'demo-service',
    {
      properties: {
        stringProps: {
          status: 'active',
        },
      },
    }
  );
  console.log(`Updated entity: ${updated.identifier}\n`);

  // 6. Clean up
  console.log('🧹 Cleaning up...');
  await client.entities.delete('demo-service-1', 'demo-service');
  await client.entities.delete('demo-service-2', 'demo-service');
  await client.blueprints.delete('demo-service');
  console.log('✓ Cleanup complete\n');

  console.log('✅ Demo completed successfully!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
```

Run it:

```bash
npx tsx demo.ts
```

## Tips & Best Practices

1. **Always handle errors**: Wrap SDK calls in try-catch blocks
2. **Use TypeScript**: Get full type safety and autocomplete
3. **Enable logging in development**: Helps with debugging
4. **Set reasonable timeouts**: Adjust based on your use case
5. **Clean up test resources**: Delete entities and blueprints after testing
6. **Use environment variables**: Never hardcode credentials

## Need Help?

- Check the [FAQ](../FAQ.md)
- Browse [Examples](../EXAMPLES.md)
- Read the [API Reference](../api/)
- Open an [issue on GitHub](https://github.com/port-labs/port-sdk/issues)


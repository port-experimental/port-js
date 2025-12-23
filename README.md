# Port SDK for TypeScript/JavaScript

[![npm version](https://badge.fury.io/js/@port-experimental%2Fport-sdk.svg)](https://www.npmjs.com/package/@port-experimental/port-sdk)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

Type-safe SDK for the Port.io API. Built for Node.js backend environments.

## [WARNING] Backend Only

**This SDK is for backend/server use only.** Do not use in browser applications.

[OK] Node.js, Express, NestJS, serverless functions 
[ERROR] React, Vue, Angular, browser apps

--- ## Installation

```bash
npm install @port-experimental/port-sdk
```

--- ## Quick Start

```typescript
import { PortClient } from '@port-experimental/port-sdk';

// Initialize
const client = new PortClient({
 credentials: {
 clientId: process.env.PORT_CLIENT_ID!,
 clientSecret: process.env.PORT_CLIENT_SECRET!,
 },
});

// Use
const blueprints = await client.blueprints.list();
const entity = await client.entities.create({
 identifier: 'my-service',
 blueprint: 'service',
 title: 'My Service',
 properties: {
 stringProps: { environment: 'production' },
 },
});
```

--- ## API Overview

The SDK provides resource-based access:

```typescript
client.entities // Create, read, update, delete, aggregate and stream entities
client.blueprints // Manage blueprints and permissions
client.actions // Execute actions
client.pages // Manage pages and dashboards
client.teams // Manage teams
client.users // Manage users
client.webhooks // Configure webhooks
client.scorecards // Work with scorecards
client.audit // Query audit logs
```

--- ## Common Operations

### Entities

```typescript
// Create
const entity = await client.entities.create({
 identifier: 'my-service',
 blueprint: 'service',
 title: 'My Service',
 properties: {
 stringProps: { environment: 'production' },
 },
});

// Get
const service = await client.entities.get('my-service', 'service');

// Update
await client.entities.update('my-service', 'service', {
 properties: { stringProps: { status: 'active' } },
});

// Search
const results = await client.entities.search({
  combinator: 'and',
  rules: [
    { property: '$blueprint', operator: '=', value: 'service' },
    { property: 'environment', operator: '=', value: 'production' },
  ],
});

// Stream (Async Iterator)
for await (const entity of client.entities.stream({ blueprint: 'service' })) {
  console.log(entity.identifier);
}

// Aggregate
const stats = await client.entities.aggregate({
  blueprint: 'service',
  aggregations: {
    total_count: { func: 'count' },
  },
});

// Delete
await client.entities.delete('my-service', 'service');
await client.entities.deleteAll('service'); // Delete all entities in a blueprint
```

### Blueprints

```typescript
// List all
const blueprints = await client.blueprints.list();

// Get one
const blueprint = await client.blueprints.get('service');

// Create
await client.blueprints.create({
  identifier: 'microservice',
  title: 'Microservice',
  schema: {
    properties: {
      name: { type: 'string', title: 'Name' },
    },
  },
});

// Permissions
const perms = await client.blueprints.getPermissions('service');
await client.blueprints.updatePermissions('service', {
  read: { users: ['admin@port.io'] },
});
```

### Pages

```typescript
// List all pages
const pages = await client.pages.list();

// Get a page by ID
const page = await client.pages.get('my-page-id');

// Create a new page
await client.pages.create({
  identifier: 'new-page',
  title: 'My New Page',
  blueprint: 'service',
  widgets: [], // Add widgets here
});

// Update a page
await client.pages.update('new-page', {
  title: 'Updated Page Title',
});

// Delete a page
await client.pages.delete('new-page');
```

### Widgets

```typescript
// Add a widget to a page
await client.pages.addWidget('my-page-id', {
  type: 'scorecard',
  title: 'Service Scorecard',
  scorecard: 'my-scorecard-id',
});

// Update a widget on a page
await client.pages.updateWidget('my-page-id', 'widget-id-123', {
  title: 'Updated Scorecard Title',
});

// Delete a widget from a page
await client.pages.deleteWidget('my-page-id', 'widget-id-123');
```

### Advanced Operations

```typescript
// Execute a custom action
await client.actions.execute('my-action-id', {
  properties: {
    entity: 'my-service',
  },
});

// Get audit logs
const auditLogs = await client.audit.list({
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
});

// Webhooks
const webhooks = await client.webhooks.list();
await client.webhooks.create({
  identifier: 'my-webhook',
  url: 'https://my-service.com/webhook',
  events: ['entity_created', 'entity_updated'],
});
```

--- ## Configuration

### Environment Variables

```bash
PORT_CLIENT_ID=your_client_id
PORT_CLIENT_SECRET=your_client_secret
PORT_REGION=eu # Optional: eu or us (default: eu)
PORT_LOG_LEVEL=info # Optional: error, warn, info, debug, trace
```

### Programmatic

```typescript
const client = new PortClient({
 credentials: {
 clientId: 'your-client-id',
 clientSecret: 'your-client-secret',
 },
 region: 'eu', // or 'us'
 timeout: 30000, // Request timeout in ms
 maxRetries: 3, // Retry attempts
});
```

### Authentication Methods

```typescript
// OAuth2 (recommended)
credentials: {
 clientId: process.env.PORT_CLIENT_ID!,
 clientSecret: process.env.PORT_CLIENT_SECRET!,
}

// JWT token
credentials: {
 accessToken: 'your-jwt-token',
}
```

--- ## Error Handling

```typescript
import {
 PortAuthError,
 PortNotFoundError,
 PortValidationError,
 PortRateLimitError,
} from '@port-experimental/port-sdk';

try {
 await client.entities.get('unknown-id', 'service');
} catch (error) {
 if (error instanceof PortNotFoundError) {
 console.log('Entity not found');
 } else if (error instanceof PortAuthError) {
 console.log('Authentication failed');
 } else if (error instanceof PortRateLimitError) {
 console.log('Rate limited');
 }
}
```

--- ## Examples

See the [`examples/`](./examples/) directory for complete examples:

- Basic usage
- Entity CRUD operations
- Search and filtering
- Batch operations
- Error handling

Run an example:
```bash
pnpm tsx examples/01-basic-usage.ts
```

--- ## Troubleshooting

### Authentication Issues

**Error**: `PortAuthError: Authentication failed`

- Verify credentials in Port.io Settings
- Check environment variables: `PORT_CLIENT_ID`, `PORT_CLIENT_SECRET`
- Ensure `.env` file is loaded correctly

**Error**: `PortAuthError: Token refresh failed`

- Generate new API credentials in your Port account

### Network Issues

**Error**: `PortNetworkError: Network request failed`

- Check internet connectivity
- Verify Port API accessibility: `curl https://api.port.io/v1/health`
- Check firewall rules (allow HTTPS port 443)

**Error**: `PortTimeoutError: Request timeout`

- Increase timeout: `timeout: 60000` (60 seconds)
- Check network latency

### Rate Limiting

**Error**: `PortRateLimitError: Rate limit exceeded`

- SDK automatically retries with `Retry-After` header
- Implement custom rate limiting between requests
- Use batch operations when available

### Entity Operations

**Error**: `PortNotFoundError: Entity not found`

- Verify entity exists: `await client.entities.list({ blueprint: 'service' })`
- Check blueprint parameter matches
- Use search to find entities by partial name

**Error**: `PortValidationError: Validation failed`

- Check blueprint schema: `await client.blueprints.get('service')`
- Verify property types match (string, number, boolean, array)
- Ensure related entities exist before creating relations

### Debug Mode

Enable verbose logging:

```typescript
const client = new PortClient({
 credentials: { /* ... */ },
 logger: {
 level: LogLevel.DEBUG,
 enabled: true,
 },
});
```

Or set environment variable:
```bash
export PORT_LOG_LEVEL=debug
```

--- ## Documentation

- [Getting Started Guide](./docs/getting-started.md) - Install and use the SDK
- [API Reference](./docs/api/) - Auto-generated TypeDoc documentation

--- ## Support

- [Port.io Documentation](https://docs.port.io)
- [Community Slack](https://port.io/community)
- [GitHub Issues](https://github.com/port-experimental/port-js/issues)

--- ## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

--- ## License

[Apache-2.0](./LICENSE)

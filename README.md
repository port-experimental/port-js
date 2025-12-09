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
client.entities // Create, read, update, delete entities
client.blueprints // Manage blueprints
client.actions // Execute actions
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

// Delete
await client.entities.delete('my-service', 'service');
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

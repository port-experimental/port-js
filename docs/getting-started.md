# Getting Started

Install and start using the Port SDK.

## Installation

```bash
npm install @port-experimental/port-sdk
```

## Setup

### 1. Get Credentials

Get your API credentials from [Port.io Settings](https://app.getport.io/settings):
- Client ID
- Client Secret

### 2. Initialize Client

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({
 credentials: {
 clientId: process.env.PORT_CLIENT_ID!,
 clientSecret: process.env.PORT_CLIENT_SECRET!,
 },
});
```

### 3. Environment Variables

Create a `.env` file:

```bash
PORT_CLIENT_ID=your_client_id
PORT_CLIENT_SECRET=your_client_secret
PORT_REGION=eu # Optional: eu or us
```

## Basic Usage

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
// List
const blueprints = await client.blueprints.list();

// Get
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

### Teams

```typescript
// Create
const team = await client.teams.create({
 name: 'platform-team',
 description: 'Platform Engineering',
 users: ['user1@example.com'],
});

// Get
const team = await client.teams.get('platform-team');

// Update
await client.teams.update('platform-team', {
 description: 'Updated description',
});
```

## Error Handling

```typescript
import {
 PortAuthError,
 PortNotFoundError,
 PortValidationError,
} from '@port-experimental/port-sdk';

try {
 await client.entities.get('unknown-id', 'service');
} catch (error) {
 if (error instanceof PortNotFoundError) {
 console.log('Entity not found');
 } else if (error instanceof PortAuthError) {
 console.log('Authentication failed');
 }
}
```

## Configuration

### Environment Variables

```bash
PORT_CLIENT_ID=your_client_id
PORT_CLIENT_SECRET=your_client_secret
PORT_REGION=eu # Optional: eu or us
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

## Available Resources

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

## Examples

See the [`examples/`](../examples/) directory for complete working examples.

Run an example:
```bash
pnpm tsx examples/01-basic-usage.ts
```

## Next Steps

- [API Reference](./api/) - Complete API documentation
- [GitHub Repository](https://github.com/port-experimental/port-js)
- [Port.io Documentation](https://docs.port.io)

# Port SDK for TypeScript/JavaScript

[![npm version](https://badge.fury.io/js/@port-labs%2Fport-sdk.svg)](https://www.npmjs.com/package/@port-labs/port-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

> **Official TypeScript/JavaScript SDK for [Port.io](https://getport.io)** - The Internal Developer Portal Platform

A type-safe, feature-rich SDK for interacting with Port.io's API. Built with security, developer experience, and reliability in mind.

## ✨ Key Features

- 🔐 **Secure by Default** - Built with security-first principles
- 📘 **Fully Typed** - Complete TypeScript support with auto-generated types
- 🌍 **Multi-Region** - Support for EU and US instances
- 🔄 **Auto-Retry** - Intelligent retry logic with exponential backoff
- 🔌 **Proxy Support** - Corporate proxy support with authentication
- 🔑 **Flexible Auth** - OAuth2 and JWT token support
- ⚙️ **Environment Config** - Load configuration from environment variables or .env files
- 🧪 **Well Tested** - 87.59% code coverage with 292+ tests

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @port-labs/port-sdk

# Using npm
npm install @port-labs/port-sdk

# Using yarn
yarn add @port-labs/port-sdk
```

## 🚀 Quick Start

```typescript
import { PortClient } from '@port-labs/port-sdk';

// Initialize the client
const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  },
});

// List all blueprints
const blueprints = await client.blueprints.list();
console.log(`Found ${blueprints.data.length} blueprints`);

// Create an entity
const entity = await client.entities.create({
  identifier: 'my-service',
  blueprint: 'service',
  title: 'My Service',
  properties: {
    stringProps: {
      environment: 'production',
    },
  },
});

console.log(`Created entity: ${entity.identifier}`);
```

## 📚 Documentation

### Getting Started
- [Installation & Setup](./docs/getting-started/installation.md)
- [Authentication](./docs/getting-started/authentication.md)
- [Configuration](./docs/getting-started/configuration.md)
- [Quick Start Guide](./docs/getting-started/quickstart.md)

### API Reference
- [Blueprints](./docs/api/blueprints.md)
- [Entities](./docs/api/entities.md)
- [Actions](./docs/api/actions.md)
- [Scorecards](./docs/api/scorecards.md)

### Guides
- [Error Handling](./docs/guides/error-handling.md)
- [Logging & Debugging](./docs/guides/logging.md)
- [Proxy Configuration](./docs/guides/proxy.md)
- [Rate Limiting](./docs/guides/rate-limiting.md)

### Examples
- [View All Examples](./docs/EXAMPLES.md)
- [Run Examples Locally](./examples/README.md)

### Development
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Testing Guide](./docs/TESTING.md)

## 💡 Common Use Cases

### Working with Entities

```typescript
// Search entities
const results = await client.entities.search({
  combinator: 'and',
  rules: [
    { property: '$blueprint', operator: '=', value: 'service' },
    { property: 'environment', operator: '=', value: 'production' },
  ],
});

// Update an entity
await client.entities.update('my-service', 'service', {
  properties: {
    stringProps: { status: 'active' },
  },
});

// Delete an entity
await client.entities.delete('my-service', 'service');
```

### Managing Blueprints

```typescript
// Create a blueprint
await client.blueprints.create({
  identifier: 'microservice',
  title: 'Microservice',
  schema: {
    properties: {
      name: { type: 'string', title: 'Name' },
      version: { type: 'string', title: 'Version' },
    },
  },
});

// Get a blueprint
const blueprint = await client.blueprints.get('microservice');
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file
PORT_CLIENT_ID=your_client_id
PORT_CLIENT_SECRET=your_client_secret
PORT_BASE_URL=https://api.port.io  # Optional, defaults to EU
PORT_LOG_LEVEL=info                # Optional: error, warn, info, debug, trace
HTTP_PROXY=http://proxy:8080       # Optional
```

### Programmatic Configuration

```typescript
const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  },
  region: 'eu', // or 'us'
  timeout: 30000,
  maxRetries: 3,
  logger: {
    level: 3, // 0=ERROR, 1=WARN, 2=INFO, 3=DEBUG, 4=TRACE
    enabled: true,
  },
});
```

See [Configuration Guide](./docs/getting-started/configuration.md) for all options.

## 🔐 Authentication

The SDK supports multiple authentication methods:

**OAuth2 (Client Credentials)**
```typescript
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID,
    clientSecret: process.env.PORT_CLIENT_SECRET,
  },
});
```

**JWT Token**
```typescript
const client = new PortClient({
  credentials: {
    accessToken: 'your-jwt-token',
  },
});
```

See [Authentication Guide](./docs/getting-started/authentication.md) for more details.

## 🛡️ Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import { 
  PortAuthError, 
  PortNotFoundError, 
  PortValidationError,
  PortRateLimitError 
} from '@port-labs/port-sdk';

try {
  await client.entities.get('unknown-id', 'service');
} catch (error) {
  if (error instanceof PortNotFoundError) {
    console.log('Entity not found');
  } else if (error instanceof PortAuthError) {
    console.log('Authentication failed');
  } else {
    console.log('Unexpected error:', error);
  }
}
```

See [Error Handling Guide](./docs/guides/error-handling.md) for comprehensive error handling patterns.

## 🌍 Multi-Region Support

```typescript
// EU region (default)
const euClient = new PortClient({ 
  credentials,
  region: 'eu' 
});

// US region
const usClient = new PortClient({ 
  credentials,
  region: 'us' 
});

// Custom base URL
const customClient = new PortClient({ 
  credentials,
  baseUrl: 'https://custom.port.io' 
});
```

## 📊 Testing

```bash
# Run unit tests
pnpm test

# Run unit tests with coverage
pnpm test:coverage

# Run integration tests (requires credentials)
pnpm test:integration

# Run smoke tests (manual verification)
pnpm smoke
```

See [Testing Guide](./docs/TESTING.md) for more information.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

[MIT](./LICENSE)

## 🔗 Links

- [Port.io Documentation](https://docs.port.io)
- [Port.io API Reference](https://docs.port.io/api-reference)
- [GitHub Repository](https://github.com/port-labs/port-sdk)
- [npm Package](https://www.npmjs.com/package/@port-labs/port-sdk)
- [Changelog](./CHANGELOG.md)

## 💬 Support

- 📧 Email: support@getport.io
- 💬 Slack: [Port Community](https://port.io/community)
- 🐛 Issues: [GitHub Issues](https://github.com/port-labs/port-sdk/issues)
- 📖 Docs: [docs.port.io](https://docs.port.io)

---

**Made with ❤️ by the Port team**

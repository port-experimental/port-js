# Port SDK for TypeScript/JavaScript

[![npm version](https://badge.fury.io/js/@port-experimental%2Fport-sdk.svg)](https://www.npmjs.com/package/@port-experimental/port-sdk)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

> **Official TypeScript/JavaScript SDK for [Port.io](https://getport.io)** - The Internal Developer Portal Platform

A type-safe, feature-rich SDK for interacting with Port.io's API. Built with security, developer experience, and reliability in mind.

---

## ⚠️ **IMPORTANT: Backend/Server-Side Only**

> **🚨 This SDK is designed for backend/server-side use ONLY.**
>
> **DO NOT use this SDK in browser/frontend applications** where code is exposed to end users.
>
> **Why?**
> - Requires **client credentials** (Client ID & Secret) that must be kept secure
> - Credentials in frontend code are **publicly accessible** and pose a **critical security risk**
> - Designed for Node.js server environments (Express, NestJS, serverless functions, etc.)
>
> **Supported Environments:**
> - ✅ Node.js (v20+)
> - ✅ Backend servers (Express, Fastify, Koa, etc.)
> - ✅ Serverless functions (AWS Lambda, Vercel, Netlify, etc.)
> - ✅ CI/CD pipelines (GitHub Actions, GitLab CI, etc.)
> - ✅ CLI tools and scripts
>
> **NOT Supported:**
> - ❌ Browser applications (React, Vue, Angular, etc.)
> - ❌ Client-side JavaScript
> - ❌ Mobile apps (React Native, Ionic, etc.)
>
> For frontend integrations, create a **backend API** that uses this SDK and exposes only necessary data to your frontend.

---

## ✨ Key Features

- 🔐 **Secure by Default** - Built with security-first principles
- 📘 **Fully Typed** - Complete TypeScript support with auto-generated types
- 🌍 **Multi-Region** - Support for EU and US instances
- 🔄 **Auto-Retry** - Intelligent retry logic with exponential backoff
- 🔌 **Proxy Support** - Corporate proxy support with authentication
- 🔑 **Flexible Auth** - OAuth2 and JWT token support
- ⚙️ **Environment Config** - Load configuration from environment variables or .env files
- 🧪 **Well Tested** - 86.6% code coverage with comprehensive test suite

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @port-experimental/port-sdk

# Using npm
npm install @port-experimental/port-sdk

# Using yarn
yarn add @port-experimental/port-sdk
```

## 🚀 Quick Start

```typescript
import { PortClient } from '@port-experimental/port-sdk';

// Initialize the client
const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  },
});

// List all blueprints
const blueprints = await client.blueprints.list();
console.log(`Found ${blueprints.length} blueprints`);

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
- [Quick Start Guide](./docs/getting-started/quickstart.md)
- [⚠️ Backend/Server-Side Only Notice](./docs/BACKEND_ONLY.md) - **Read this first!**
- [API Documentation](./docs/api/) - Auto-generated TypeDoc documentation

### Development
- [Development Guide](./docs/development/README.md)
- [API Coverage Analysis](./API_COVERAGE_ANALYSIS.md) - What's implemented vs missing
- [Automated Workflows](./docs/development/AUTOMATED_WORKFLOWS.md) - Daily OpenAPI sync & health checks
- [Contributing Guide](./CONTRIBUTING.md)
- [Commit Message Cheatsheet](./docs/development/COMMIT_MESSAGES.md)

**Type Generation:**
```bash
# Download latest OpenAPI spec and regenerate types
pnpm types:update

# Or run separately
pnpm types:download  # Download from https://api.port.io/swagger/json
pnpm types:generate  # Generate src/types/api.ts
```
- [Security Policy](./SECURITY.md)
- [Credential Security](./docs/development/CREDENTIAL_SECURITY.md)
- [Testing Guide](./docs/TESTING.md)

### Examples
- [View All Examples](./docs/EXAMPLES.md)
- [Run Examples Locally](./examples/README.md)

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
await client.entities.update('my-service', {
  properties: {
    stringProps: { status: 'active' },
  },
}, 'service');

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

### Working with Webhooks

```typescript
// Create a webhook
await client.webhooks.create({
  identifier: 'github-webhook',
  title: 'GitHub Integration',
  url: 'https://api.github.com/webhook',
  enabled: true,
  integrationType: 'custom',
  mappings: [
    {
      blueprint: 'service',
      filter: {
        combinator: 'and',
        rules: [{ property: '$identifier', operator: '=', value: 'my-service' }]
      }
    }
  ]
});

// List all webhooks
const webhooks = await client.webhooks.list();

// Update a webhook
await client.webhooks.update('github-webhook', {
  enabled: false
});
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
} from '@port-experimental/port-sdk';

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

[Apache-2.0](./LICENSE)

## 🔗 Links

- [Port.io Documentation](https://docs.port.io)
- [Port.io API Reference](https://docs.port.io/api-reference/port-api)
- [GitHub Repository](https://github.com/port-experimental/port-js)
- [npm Package](https://www.npmjs.com/package/@port-experimental/port-sdk)
- [Changelog](./CHANGELOG.md)

## 💬 Support

- 💬 Slack: [Port Community](https://port.io/community)
- 🐛 Issues: [GitHub Issues](https://github.com/port-experimental/port-sdk/issues)
- 📖 Docs: [docs.port.io](https://docs.port.io)

---

**Made with ❤️ by the Port team**

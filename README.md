# Port SDK for TypeScript/JavaScript

[![npm version](https://badge.fury.io/js/@port-labs%2Fport-sdk.svg)](https://www.npmjs.com/package/@port-labs/port-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

> **Official TypeScript/JavaScript SDK for [Port.io](https://getport.io)** - The Internal Developer Portal Platform

A type-safe, feature-rich SDK for interacting with Port.io's API. Built with security, developer experience, and reliability in mind.

## ✨ Features

- 🔐 **Secure by Default** - Built with security-first principles
- 📘 **Fully Typed** - Complete TypeScript support with auto-generated types from OpenAPI
- 🌍 **Multi-Region** - Support for EU and US instances
- 🔄 **Auto-Retry** - Intelligent retry logic with exponential backoff
- 🚦 **Rate Limiting** - Client-side rate limiting to respect API limits
- 🔌 **Proxy Support** - Corporate proxy support with authentication
- 🔑 **Flexible Auth** - OAuth2 (Client Credentials) and JWT token support
- ⚙️ **Environment Config** - Load configuration from environment variables or .env files
- 📦 **Tree-Shakeable** - Optimized bundle size with ESM support
- 🧪 **Well Tested** - Comprehensive unit and integration tests

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @port-labs/port-sdk

# Using npm
npm install @port-labs/port-sdk

# Using yarn
yarn add @port-labs/port-sdk
```

## 📚 Examples

Learn by example! We have runnable code samples for every feature:

```bash
# Setup credentials first
cp examples/.env.example examples/.env
# Edit examples/.env with your Port credentials

# Run examples
pnpm tsx examples/01-basic-usage.ts      # Getting started
pnpm tsx examples/04-entities-crud.ts    # Entity CRUD operations
pnpm tsx examples/05-entities-search.ts  # Search and filtering
pnpm tsx examples/06-entities-batch.ts   # Batch operations
```

📖 **[View all examples](./examples/)** | **[Examples documentation](./docs/EXAMPLES.md)**

## 🚀 Quick Start

### Basic Usage with OAuth Credentials

```typescript
import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  },
});

// Use the client
const entities = await client.entities.list();
console.log(entities);
```

### Using Environment Variables

Create a `.env` file:

```bash
PORT_CLIENT_ID=your-client-id
PORT_CLIENT_SECRET=your-client-secret
PORT_REGION=eu  # or 'us'
```

Then initialize the client:

```typescript
import { PortClient } from '@port-labs/port-sdk';

// Automatically loads from .env file
const client = new PortClient();
```

### Using JWT Access Token

```typescript
import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient({
  credentials: {
    accessToken: 'your-jwt-token',
  },
});
```

## 🔧 Configuration

### Authentication

The SDK supports multiple authentication methods:

#### 1. OAuth2 Client Credentials (Recommended)

```typescript
const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  },
});
```

#### 2. JWT Access Token

```typescript
const client = new PortClient({
  credentials: {
    accessToken: 'your-jwt-token',
  },
});
```

#### 3. Environment Variables

Set environment variables:
- `PORT_CLIENT_ID` + `PORT_CLIENT_SECRET` for OAuth
- `PORT_ACCESS_TOKEN` for JWT

```typescript
const client = new PortClient(); // Auto-loads from env
```

### Regional Configuration

Port supports multiple regions. Configure your region:

#### Using Region Parameter

```typescript
const client = new PortClient({
  region: 'us', // 'eu' or 'us'
  credentials: { /* ... */ },
});
```

#### Using Base URL

```typescript
const client = new PortClient({
  baseUrl: 'https://api.us.getport.io',
  credentials: { /* ... */ },
});
```

#### Using Environment Variable

```bash
PORT_REGION=us  # EU: https://api.getport.io, US: https://api.us.getport.io
```

**Supported Regions:**
- **EU** (default): `https://api.getport.io`
- **US**: `https://api.us.getport.io`

### Proxy Configuration

Configure HTTP/HTTPS proxy for corporate environments:

#### Using Configuration Object

```typescript
const client = new PortClient({
  credentials: { /* ... */ },
  proxy: {
    url: 'http://proxy.company.com:8080',
    auth: {
      username: 'proxy-user',
      password: 'proxy-password',
    },
  },
});
```

#### Using Environment Variables

```bash
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
NO_PROXY=localhost,127.0.0.1,.local

# Optional: Proxy authentication
PROXY_AUTH_USERNAME=proxy-user
PROXY_AUTH_PASSWORD=proxy-password
```

### Advanced Configuration

```typescript
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
  region: 'eu',
  timeout: 30000,        // Request timeout in ms (default: 30000)
  maxRetries: 3,         // Max retry attempts (default: 3)
  retryDelay: 1000,      // Initial retry delay in ms (default: 1000)
  proxy: { /* ... */ },  // Proxy configuration
  loadEnv: true,         // Load from .env file (default: true)
  envPath: '.env.local', // Custom .env path (default: '.env')
});
```

## 📚 Usage Examples

### Working with Entities

```typescript
// List entities
const entities = await client.entities.list({
  blueprint: 'service',
  limit: 50,
});

// Get a specific entity
const entity = await client.entities.get('my-service');

// Create an entity
const newEntity = await client.entities.create({
  identifier: 'my-service',
  blueprint: 'service',
  title: 'My Service',
  properties: {
    stringProps: {
      environment: 'production',
      language: 'typescript',
    },
    numberProps: {
      port: 3000,
    },
    booleanProps: {
      isPublic: true,
    },
  },
  relations: {
    singleRelations: {
      owner: 'user@company.com',
      team: 'backend-team',
    },
    manyRelations: {
      dependencies: ['database', 'cache'],
    },
  },
});

// Update an entity
const updated = await client.entities.update('my-service', {
  title: 'My Updated Service',
  properties: {
    stringProps: {
      status: 'healthy',
    },
  },
});

// Delete an entity
await client.entities.delete('my-service');

// Search entities
const results = await client.entities.search({
  blueprint: 'service',
  search: 'production',
  rules: [
    {
      property: 'environment',
      operator: '=',
      value: 'production',
    },
  ],
  combinator: 'and',
});

// Batch operations
const batchCreated = await client.entities.batchCreate([
  { identifier: 'service-1', blueprint: 'service', title: 'Service 1' },
  { identifier: 'service-2', blueprint: 'service', title: 'Service 2' },
]);
```

### Working with Blueprints

```typescript
// List blueprints
const blueprints = await client.blueprints.list();

// Get a blueprint
const blueprint = await client.blueprints.get('service');

// Create a blueprint
const newBlueprint = await client.blueprints.create({
  identifier: 'service',
  title: 'Service',
  icon: 'Service',
  schema: {
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        required: true,
      },
      environment: {
        type: 'string',
        enum: ['development', 'staging', 'production'],
        enumColors: {
          development: 'blue',
          staging: 'yellow',
          production: 'green',
        },
      },
    },
  },
  relations: {
    owner: {
      target: '_user',
      title: 'Owner',
      required: true,
      many: false,
    },
  },
});

// Update a blueprint
await client.blueprints.update('service', {
  title: 'Updated Service',
});

// Delete a blueprint
await client.blueprints.delete('service');
```

### Working with Actions

```typescript
// List actions
const actions = await client.actions.list();

// Get an action
const action = await client.actions.get('deploy-service');

// Create an action
const newAction = await client.actions.create({
  identifier: 'deploy-service',
  title: 'Deploy Service',
  icon: 'Deployment',
  blueprint: 'service',
  trigger: 'DAY-2',
  invocationMethod: {
    type: 'WEBHOOK',
    url: 'https://api.company.com/deploy',
    method: 'POST',
  },
  userInputs: {
    environment: {
      type: 'string',
      title: 'Environment',
      enum: ['staging', 'production'],
      required: true,
    },
  },
});

// Execute an action
const run = await client.actions.execute('deploy-service', {
  properties: {
    environment: 'production',
  },
  relatedEntityIdentifier: 'my-service',
});

// Get action run status
const runStatus = await client.actions.getRun(run.id);
```

### Working with Scorecards

```typescript
// List scorecards
const scorecards = await client.scorecards.list();

// Get a scorecard
const scorecard = await client.scorecards.get('service-maturity');

// Create a scorecard
const newScorecard = await client.scorecards.create({
  identifier: 'service-maturity',
  title: 'Service Maturity',
  blueprint: 'service',
  levels: [
    { color: 'red', title: 'Basic' },
    { color: 'yellow', title: 'Bronze' },
    { color: 'green', title: 'Silver' },
    { color: 'blue', title: 'Gold' },
  ],
  rules: [
    {
      identifier: 'has-readme',
      title: 'Has README',
      level: 'Bronze',
      query: {
        property: 'hasReadme',
        operator: '=',
        value: true,
      },
    },
  ],
});
```

## 🔐 Security Best Practices

This SDK is built with security as the highest priority. Please follow these guidelines:

### Credential Management

✅ **DO:**
- Store credentials in environment variables or secure vaults
- Use `.env` files for local development (never commit them)
- Rotate credentials regularly
- Use OAuth2 client credentials when possible

❌ **DON'T:**
- Hardcode credentials in your source code
- Commit credentials to version control
- Share credentials in logs or error messages
- Use production credentials in development

### Example: Secure Credential Loading

```typescript
// ✅ GOOD - Load from environment
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});

// ❌ BAD - Hardcoded credentials
const client = new PortClient({
  credentials: {
    clientId: 'your-client-id',      // Never do this!
    clientSecret: 'your-secret',     // Never do this!
  },
});
```

### Proxy Security

When using proxies, ensure credentials are properly secured:

```typescript
// Load proxy credentials from environment
const client = new PortClient({
  credentials: { /* ... */ },
  proxy: {
    url: process.env.HTTP_PROXY!,
    auth: process.env.PROXY_AUTH_USERNAME ? {
      username: process.env.PROXY_AUTH_USERNAME,
      password: process.env.PROXY_AUTH_PASSWORD!,
    } : undefined,
  },
});
```

## 🚨 Error Handling

The SDK provides typed error classes for better error handling:

```typescript
import {
  PortError,
  PortAuthError,
  PortNotFoundError,
  PortValidationError,
  PortRateLimitError,
  PortServerError,
} from '@port-labs/port-sdk';

try {
  const entity = await client.entities.get('my-service');
} catch (error) {
  if (error instanceof PortAuthError) {
    console.error('Authentication failed:', error.message);
    // Handle auth error (e.g., refresh credentials)
  } else if (error instanceof PortNotFoundError) {
    console.error('Entity not found:', error.message);
    // Handle not found
  } else if (error instanceof PortValidationError) {
    console.error('Validation failed:', error.validationErrors);
    // Handle validation errors
  } else if (error instanceof PortRateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
    // Handle rate limiting
  } else if (error instanceof PortServerError) {
    console.error('Server error:', error.message);
    // Handle server error
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Types

- **PortError** - Base error class
- **PortAuthError** - Authentication errors (401)
- **PortForbiddenError** - Authorization errors (403)
- **PortNotFoundError** - Resource not found (404)
- **PortValidationError** - Validation errors (422)
- **PortRateLimitError** - Rate limit exceeded (429)
- **PortServerError** - Server errors (5xx)
- **PortNetworkError** - Network/connection errors
- **PortTimeoutError** - Request timeout errors

## 🧪 Testing

### Environment Configuration for Tests

```typescript
// tests/setup.ts
import { PortClient } from '@port-labs/port-sdk';

// For integration tests
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
  baseUrl: process.env.PORT_BASE_URL || 'https://api.getport.io',
});

// Clean up test data
afterAll(async () => {
  // Delete test entities
});
```

## 📖 API Reference

For detailed API documentation, see:

- [Port.io API Documentation](https://docs.getport.io/api-reference)
- [Port.io Developer Guide](https://docs.getport.io/)

## 🛠️ Development

### Setup

```bash
# Install dependencies
pnpm install

# Generate types from OpenAPI spec
pnpm generate-types

# Build the SDK
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm type-check
```

### Project Structure

```
port-js/
├── src/
│   ├── client.ts           # Main PortClient class
│   ├── config.ts           # Configuration management
│   ├── errors.ts           # Error classes
│   ├── http-client.ts      # HTTP client with retry logic
│   ├── resources/          # API resource classes
│   │   ├── base.ts         # Base resource class
│   │   ├── entities.ts     # Entity operations
│   │   ├── blueprints.ts   # Blueprint operations
│   │   ├── actions.ts      # Action operations
│   │   └── scorecards.ts   # Scorecard operations
│   └── types/              # TypeScript type definitions
│       ├── api.ts          # Auto-generated from OpenAPI
│       ├── common.ts       # Common types
│       ├── entities.ts     # Entity types
│       ├── blueprints.ts   # Blueprint types
│       ├── actions.ts      # Action types
│       └── scorecards.ts   # Scorecard types
├── tests/                  # Test files
├── .env.example            # Example environment variables
├── .cursorrules            # Security-first development rules
└── README.md               # This file
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Security First** - Review `.cursorrules` for security guidelines
2. **Type Safety** - All code must be fully typed (no `any`)
3. **Testing** - Add tests for new features
4. **Documentation** - Update docs for API changes
5. **Conventional Commits** - Use conventional commit messages

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following `.cursorrules` guidelines
4. Run tests and type checking (`pnpm test && pnpm type-check`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT_CLIENT_ID` | Port OAuth client ID | Yes* | - |
| `PORT_CLIENT_SECRET` | Port OAuth client secret | Yes* | - |
| `PORT_ACCESS_TOKEN` | Port JWT access token | Yes* | - |
| `PORT_BASE_URL` | Port API base URL | No | `https://api.getport.io` |
| `PORT_REGION` | Port region (`eu` or `us`) | No | `eu` |
| `PORT_TIMEOUT` | Request timeout (ms) | No | `30000` |
| `PORT_MAX_RETRIES` | Max retry attempts | No | `3` |
| `HTTP_PROXY` | HTTP proxy URL | No | - |
| `HTTPS_PROXY` | HTTPS proxy URL | No | - |
| `NO_PROXY` | Hosts to bypass proxy | No | - |
| `PROXY_AUTH_USERNAME` | Proxy username | No | - |
| `PROXY_AUTH_PASSWORD` | Proxy password | No | - |

\* Either OAuth credentials (CLIENT_ID + CLIENT_SECRET) or ACCESS_TOKEN is required

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Port.io Website](https://getport.io)
- [Port.io Documentation](https://docs.getport.io)
- [Port.io API Reference](https://docs.getport.io/api-reference)
- [GitHub Repository](https://github.com/port-labs/port-sdk)
- [npm Package](https://www.npmjs.com/package/@port-labs/port-sdk)

## 💬 Support

- 📧 Email: support@getport.io
- 💬 [Community Slack](https://www.getport.io/community)
- 🐛 [GitHub Issues](https://github.com/port-labs/port-sdk/issues)
- 📖 [Documentation](https://docs.getport.io)

---

Made with ❤️ by [Port](https://getport.io)


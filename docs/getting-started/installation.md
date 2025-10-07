# Installation & Setup

This guide will help you install and set up the Port SDK in your project.

## Prerequisites

- Node.js 18 or higher
- npm, pnpm, or yarn package manager
- A Port.io account with API credentials

## Installation

### Using pnpm (Recommended)

```bash
pnpm add @port-experimental/port-sdk
```

### Using npm

```bash
npm install @port-experimental/port-sdk
```

### Using yarn

```bash
yarn add @port-experimental/port-sdk
```

## Getting API Credentials

1. Log in to your Port.io account at [app.getport.io](https://app.getport.io)
2. Navigate to **Settings** → **Credentials**
3. Click **Create API Token**
4. Copy your `Client ID` and `Client Secret`
5. Store them securely (never commit to version control)

## Initial Setup

### 1. Create Environment File

Create a `.env` file in your project root:

```bash
PORT_CLIENT_ID=your_client_id_here
PORT_CLIENT_SECRET=your_client_secret_here
PORT_BASE_URL=https://api.port.io  # Optional, defaults to EU
```

**Important:** Add `.env` to your `.gitignore`:

```bash
echo ".env" >> .gitignore
```

### 2. Install dotenv (Optional)

If you're using environment variables:

```bash
pnpm add dotenv
```

Load it at the start of your application:

```typescript
import 'dotenv/config';
```

### 3. Initialize the Client

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});
```

## Verify Installation

Test your setup with a simple script:

```typescript
// test-connection.ts
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});

async function testConnection() {
  try {
    const blueprints = await client.blueprints.list();
    console.log(`✓ Connected successfully! Found ${blueprints.data.length} blueprints`);
  } catch (error) {
    console.error('✗ Connection failed:', error);
  }
}

testConnection();
```

Run the test:

```bash
npx tsx test-connection.ts
```

## TypeScript Configuration

The SDK is written in TypeScript and includes type definitions. Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Next Steps

- [Authentication Guide](./authentication.md) - Learn about different authentication methods
- [Configuration Guide](./configuration.md) - Explore all configuration options
- [Quick Start Guide](./quickstart.md) - Start building with the SDK
- [Examples](../EXAMPLES.md) - See practical examples

## Troubleshooting

### Module not found

If you see `Cannot find module '@port-experimental/port-sdk'`:

1. Verify installation: `pnpm list @port-experimental/port-sdk`
2. Clear cache: `pnpm store prune`
3. Reinstall: `pnpm install`

### Authentication errors

If you see `PortAuthError: Authentication failed`:

1. Verify credentials are correct
2. Check credentials haven't expired
3. Ensure API access is enabled for your account
4. Verify environment variables are loaded

### TypeScript errors

If you see type errors:

1. Ensure you're using TypeScript 5.0+
2. Install type definitions: `pnpm add -D @types/node`
3. Check your `tsconfig.json` configuration

## Support

Need help? Check out:
- [FAQ](../FAQ.md)
- [GitHub Issues](https://github.com/port-experimental/port-sdk/issues)
- [Port Documentation](https://docs.port.io)


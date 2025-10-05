# Backend/Server-Side Only - Security Notice

## 🚨 Critical Security Warning

**This SDK is designed exclusively for backend/server-side environments.**

**NEVER use this SDK in browser/frontend applications, mobile apps, or any client-side code.**

---

## Why Backend Only?

### Security Risk: Credential Exposure

The Port SDK requires **OAuth2 credentials** to authenticate:

- **Client ID** - Identifies your application
- **Client Secret** - Acts as your application's password

If these credentials are included in frontend code:

1. ❌ **They are publicly accessible** to anyone who views your source code
2. ❌ **Attackers can extract them** from your bundled JavaScript
3. ❌ **Your entire Port instance is compromised**
4. ❌ **Attackers gain full access** to all your Port data and actions

### Example: What Happens in Frontend

```typescript
// ❌ CRITICAL SECURITY VULNERABILITY
// File: src/components/Dashboard.tsx (React)

import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient({
  credentials: {
    clientId: 'client_abc123',      // ⚠️ Exposed in browser DevTools!
    clientSecret: 'secret_xyz789',  // ⚠️ Visible in bundled JS!
  },
});

// Anyone can:
// 1. Open browser DevTools → Sources
// 2. Find your credentials in the JS bundle
// 3. Use them to access your entire Port instance
```

**Result:** Complete security breach. Attackers can:
- Read all your entities, blueprints, and sensitive data
- Create, modify, or delete any resources
- Execute actions with full privileges
- Access audit logs and user information

---

## ✅ Supported Environments

### Backend/Server-Side

This SDK is designed for and fully supports:

#### 1. **Node.js Servers**
```typescript
// ✅ Express.js
import express from 'express';
import { PortClient } from '@port-labs/port-sdk';

const app = express();

const portClient = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});

app.get('/api/services', async (req, res) => {
  const entities = await portClient.entities.search({
    blueprint: 'service',
  });
  res.json(entities);
});
```

```typescript
// ✅ NestJS
import { Injectable } from '@nestjs/common';
import { PortClient } from '@port-labs/port-sdk';

@Injectable()
export class PortService {
  private client: PortClient;

  constructor() {
    this.client = new PortClient({
      credentials: {
        clientId: process.env.PORT_CLIENT_ID!,
        clientSecret: process.env.PORT_CLIENT_SECRET!,
      },
    });
  }

  async getServices() {
    return this.client.entities.list({ blueprint: 'service' });
  }
}
```

#### 2. **Serverless Functions**

```typescript
// ✅ AWS Lambda
import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});

export const handler = async (event: any) => {
  const entities = await client.entities.list();
  return {
    statusCode: 200,
    body: JSON.stringify(entities),
  };
};
```

```typescript
// ✅ Vercel Functions (API Routes)
import { PortClient } from '@port-labs/port-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const client = new PortClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const services = await client.entities.search({ blueprint: 'service' });
  res.status(200).json(services);
}
```

```typescript
// ✅ Netlify Functions
import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient();

exports.handler = async (event, context) => {
  const entities = await client.entities.list();
  return {
    statusCode: 200,
    body: JSON.stringify(entities),
  };
};
```

#### 3. **CI/CD Pipelines**

```yaml
# ✅ GitHub Actions
name: Sync to Port
on: [push]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Sync Services
        env:
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
        run: node scripts/sync-to-port.js
```

```typescript
// scripts/sync-to-port.js
import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient(); // Reads from env vars

async function sync() {
  await client.entities.create({
    identifier: 'new-service',
    blueprint: 'service',
    title: 'New Service',
  });
}

sync();
```

#### 4. **CLI Tools & Scripts**

```typescript
// ✅ CLI Tool
#!/usr/bin/env node
import { PortClient } from '@port-labs/port-sdk';

const client = new PortClient();

async function main() {
  const services = await client.entities.list({ blueprint: 'service' });
  console.table(services);
}

main();
```

#### 5. **Background Jobs & Workers**

```typescript
// ✅ Bull Queue Worker (Redis)
import Queue from 'bull';
import { PortClient } from '@port-labs/port-sdk';

const portClient = new PortClient();
const syncQueue = new Queue('port-sync');

syncQueue.process(async (job) => {
  const { entityId } = job.data;
  await portClient.entities.update(entityId, {
    properties: { stringProps: { lastSync: new Date().toISOString() } },
  });
});
```

---

## ❌ Unsupported Environments

**DO NOT use this SDK in:**

### 1. Browser Applications
```typescript
// ❌ React, Vue, Angular, Svelte, etc.
import { PortClient } from '@port-labs/port-sdk';

function Dashboard() {
  const client = new PortClient({ ... }); // ❌ NEVER!
  // Credentials exposed in browser bundle
}
```

### 2. Client-Side JavaScript
```html
<!-- ❌ Never in <script> tags -->
<script type="module">
  import { PortClient } from '@port-labs/port-sdk';
  const client = new PortClient({ ... }); // ❌ Exposed to users!
</script>
```

### 3. Mobile Applications
```typescript
// ❌ React Native, Ionic, Flutter Web, etc.
import { PortClient } from '@port-labs/port-sdk';

export default function App() {
  const client = new PortClient({ ... }); // ❌ Credentials in app bundle!
}
```

### 4. Browser Extensions
```typescript
// ❌ Chrome/Firefox extensions
import { PortClient } from '@port-labs/port-sdk';

chrome.runtime.onInstalled.addListener(() => {
  const client = new PortClient({ ... }); // ❌ Extractable from extension!
});
```

---

## ✅ Correct Architecture: Backend Proxy Pattern

### Problem
Your React frontend needs to display Port entities.

### ❌ Wrong Solution
```typescript
// Frontend (React)
import { PortClient } from '@port-labs/port-sdk';

function ServiceList() {
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    const client = new PortClient({
      credentials: {
        clientId: 'abc123',      // ❌ EXPOSED!
        clientSecret: 'xyz789',  // ❌ SECURITY BREACH!
      },
    });
    
    client.entities.list({ blueprint: 'service' })
      .then(setServices);
  }, []);
  
  return <div>{/* render services */}</div>;
}
```

### ✅ Correct Solution

**Step 1: Create Backend API**

```typescript
// Backend (Express.js - server/api/services.ts)
import express from 'express';
import { PortClient } from '@port-labs/port-sdk';

const router = express.Router();

// ✅ Credentials safely stored on server
const portClient = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});

// Expose ONLY what frontend needs
router.get('/api/services', async (req, res) => {
  try {
    const services = await portClient.entities.search({
      blueprint: 'service',
    });
    
    // Optional: Filter/transform data before sending
    const publicData = services.map(s => ({
      id: s.identifier,
      name: s.title,
      environment: s.properties.stringProps?.environment,
    }));
    
    res.json(publicData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

export default router;
```

**Step 2: Call Backend API from Frontend**

```typescript
// Frontend (React - components/ServiceList.tsx)
import { useEffect, useState } from 'react';

function ServiceList() {
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    // ✅ Call your own backend API (no credentials!)
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices);
  }, []);
  
  return (
    <div>
      {services.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Credentials stay on server
- ✅ No security risk
- ✅ You control what data is exposed
- ✅ Can add authentication/authorization
- ✅ Can cache responses
- ✅ Can transform/filter sensitive data

---

## Security Best Practices

### 1. Use Environment Variables

Never hardcode credentials:

```typescript
// ❌ BAD
const client = new PortClient({
  credentials: {
    clientId: 'client_abc123',
    clientSecret: 'secret_xyz789',
  },
});

// ✅ GOOD
const client = new PortClient({
  credentials: {
    clientId: process.env.PORT_CLIENT_ID!,
    clientSecret: process.env.PORT_CLIENT_SECRET!,
  },
});
```

### 2. Keep Credentials Secure

```bash
# .env (NEVER commit to git)
PORT_CLIENT_ID=your_client_id
PORT_CLIENT_SECRET=your_client_secret
```

```bash
# .gitignore (ALWAYS include)
.env
.env.local
.env.*.local
```

### 3. Use Secret Management

For production:
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- HashiCorp Vault
- Docker Secrets
- Kubernetes Secrets

### 4. Rotate Credentials Regularly

- Change credentials every 90 days (or per your security policy)
- Immediately rotate if exposed or compromised
- Use separate credentials for dev/staging/production

### 5. Principle of Least Privilege

- Create backend APIs that expose only what's needed
- Don't pass raw Port entities to frontend
- Filter sensitive fields before sending to client
- Implement proper authentication/authorization

---

## Environment Detection

The SDK does not automatically detect or prevent use in browsers. It's your responsibility to:

1. ✅ Only import and use the SDK in backend code
2. ✅ Keep credentials in environment variables
3. ✅ Never commit credentials to version control
4. ✅ Use backend APIs to proxy Port data to frontends

---

## Frequently Asked Questions

### Q: Can I use this in Next.js?

**A:** Yes, but only in **Server Components** or **API Routes** (server-side).

```typescript
// ✅ GOOD - Next.js API Route (pages/api/services.ts)
import { PortClient } from '@port-labs/port-sdk';

export default async function handler(req, res) {
  const client = new PortClient();
  const services = await client.entities.list();
  res.json(services);
}

// ✅ GOOD - Server Component (app/services/page.tsx)
import { PortClient } from '@port-labs/port-sdk';

export default async function ServicesPage() {
  const client = new PortClient();
  const services = await client.entities.list();
  return <div>{/* render */}</div>;
}

// ❌ BAD - Client Component
'use client';
import { PortClient } from '@port-labs/port-sdk';

export default function ServicesPage() {
  const client = new PortClient(); // ❌ Runs in browser!
}
```

### Q: Can I use this in Electron apps?

**A:** Yes, but only in the **main process** (Node.js), not the renderer process (browser).

### Q: What about React Native?

**A:** No. React Native apps run on user devices. Use a backend API instead.

### Q: Can I use environment-restricted credentials?

**A:** This doesn't make frontend use safe. Even read-only credentials should never be exposed in client code.

---

## Summary

✅ **DO:**
- Use in Node.js backend servers
- Use in serverless functions
- Use in CI/CD pipelines
- Use in CLI tools
- Store credentials in environment variables
- Create backend APIs for frontend access

❌ **DON'T:**
- Use in browser applications
- Use in mobile apps
- Use in browser extensions
- Hardcode credentials
- Commit credentials to git
- Expose raw Port data to untrusted clients

---

## Related Documentation

- [Security Policy](../SECURITY.md)
- [Credential Security Guide](./development/CREDENTIAL_SECURITY.md)
- [Environment Configuration](./getting-started/installation.md#environment-variables)
- [Best Practices](./development/README.md#best-practices)

---

**Remember:** When in doubt, ask yourself: "Are my credentials secure?" If there's any chance they could be exposed to end users, don't use the SDK there.

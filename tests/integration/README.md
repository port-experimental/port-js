# Integration Tests

Integration tests for the Port SDK that run against a **real Port API instance**.

## Overview

These tests verify that the SDK correctly interacts with the actual Port.io API, testing:
- Authentication and authorization
- CRUD operations on real resources
- API error handling
- Data consistency
- Pagination and search
- Batch operations

## Prerequisites

### 1. Port Account
You need a Port.io account with API credentials:
- Client ID
- Client Secret

### 2. Environment Variables
Create a `.env.local` file in the project root:

```bash
PORT_CLIENT_ID=your_client_id_here
PORT_CLIENT_SECRET=your_client_secret_here
PORT_BASE_URL=https://api.port.io  # Optional, defaults to EU
```

### 3. Permissions
Your Port credentials must have permissions to:
- Create and delete blueprints
- Create, read, update, and delete entities
- List resources

## Running Integration Tests

### Run All Integration Tests
```bash
pnpm test:integration
```

### Run Specific Test File
```bash
pnpm test:integration client.integration.test
pnpm test:integration blueprints.integration.test
pnpm test:integration entities.integration.test
```

### Run with Verbose Output
```bash
pnpm test:integration --reporter=verbose
```

### Watch Mode
```bash
pnpm test:integration --watch
```

## Test Structure

```
tests/integration/
├── README.md                          # This file
├── setup.ts                           # Global test setup
├── client.integration.test.ts         # Client initialization & connectivity
├── blueprints.integration.test.ts     # Blueprint CRUD operations
├── entities.integration.test.ts       # Entity CRUD & search operations
└── actions.integration.test.ts        # Action CRUD & execution (future)
```

## Test Behavior

### Automatic Skipping
Tests automatically skip if credentials are not available:
```typescript
const hasCredentials = !!(
  process.env.PORT_CLIENT_ID && 
  process.env.PORT_CLIENT_SECRET
);

describe.skipIf(!hasCredentials)('Integration Test', () => {
  // Tests only run when credentials are present
});
```

### Cleanup
All tests include cleanup in `afterAll()` hooks to:
- Delete created entities
- Delete created blueprints
- Prevent test data pollution

Example:
```typescript
afterAll(async () => {
  // Clean up test resources
  await client.entities.delete(testEntityId);
  await client.blueprints.delete(testBlueprintId);
});
```

### Unique Identifiers
Tests use timestamp-based identifiers to avoid conflicts:
```typescript
const testId = `test_entity_${Date.now()}`;
```

## Test Coverage

### Client Integration (`client.integration.test.ts`)
- ✅ Client initialization with OAuth
- ✅ Authentication failure handling
- ✅ Region configuration (EU/US)
- ✅ Resource availability
- ✅ API connectivity
- ✅ Error handling

### Blueprint Integration (`blueprints.integration.test.ts`)
- ✅ Create blueprint
- ✅ Get blueprint
- ✅ List blueprints
- ✅ Update blueprint
- ✅ Delete blueprint
- ✅ Get blueprint relations
- ✅ System blueprints (_team, _user)
- ✅ 404 error handling

### Entity Integration (`entities.integration.test.ts`)
- ✅ Create entity
- ✅ Get entity
- ✅ Update entity
- ✅ Delete entity
- ✅ List entities
- ✅ Search entities
- ✅ Batch create
- ✅ Batch update
- ✅ Batch delete
- ✅ 404 error handling

## Common Issues & Troubleshooting

### Tests Are Skipped
**Problem**: All tests show as skipped
**Solution**: Ensure `.env.local` exists with valid credentials
```bash
# Check if file exists
ls -la .env.local

# Verify contents
cat .env.local
```

### Authentication Errors
**Problem**: `PortAuthError: Authentication failed`
**Solution**: 
1. Verify credentials are correct
2. Check credentials have not expired
3. Ensure API access is enabled for your account

### Rate Limiting
**Problem**: `PortRateLimitError: Rate limit exceeded`
**Solution**: 
- Wait for rate limit to reset
- Run fewer tests simultaneously
- Add delays between test files if needed

### Test Timeouts
**Problem**: Tests timeout after 10 seconds
**Solution**: 
- Increase timeout in test file:
  ```typescript
  it('slow test', async () => {
    // ...
  }, 30000); // 30 second timeout
  ```
- Check network connectivity
- Verify Port API is accessible

### Cleanup Failures
**Problem**: Test cleanup fails, leaving resources
**Solution**: 
- Manually delete test resources from Port dashboard
- Test identifiers contain timestamps for easy identification
- Look for resources starting with `test_` prefix

## Best Practices

### 1. Always Clean Up
```typescript
const createdIds: string[] = [];

afterAll(async () => {
  for (const id of createdIds) {
    try {
      await client.entities.delete(id);
    } catch (error) {
      console.warn(`Cleanup failed for ${id}:`, error);
    }
  }
});
```

### 2. Use Unique Identifiers
```typescript
const uniqueId = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
```

### 3. Test One Thing at a Time
```typescript
// ✅ GOOD - Clear, focused test
it('should create an entity', async () => {
  const entity = await client.entities.create(data);
  expect(entity.identifier).toBe(data.identifier);
});

// ❌ BAD - Testing multiple things
it('should do everything', async () => {
  const entity = await client.entities.create(data);
  const updated = await client.entities.update(entity.id, changes);
  await client.entities.delete(updated.id);
});
```

### 4. Handle Errors Gracefully
```typescript
it('should handle 404 errors', async () => {
  await expect(
    client.entities.get('non_existent_id')
  ).rejects.toThrow(PortNotFoundError);
});
```

### 5. Use Appropriate Timeouts
```typescript
// Default: 10 seconds
it('quick operation', async () => { /* ... */ });

// Extended: 30 seconds for slow operations
it('bulk operation', async () => { /* ... */ }, 30000);
```

## CI/CD Integration

### GitHub Actions
Integration tests can run in CI with secrets:

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:  # Manual trigger

jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run integration tests
        env:
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
        run: pnpm test:integration
```

### Required Secrets
Add to GitHub repository secrets:
- `PORT_CLIENT_ID`
- `PORT_CLIENT_SECRET`

## Debugging

### Enable Verbose Logging
```typescript
const client = new PortClient({
  credentials: { /* ... */ },
  logger: {
    level: 4, // TRACE level
    enabled: true,
  },
});
```

### Inspect API Requests
```bash
# Set environment variable before running tests
export PORT_LOG_LEVEL=debug
pnpm test:integration
```

### View Raw API Responses
Add console.log in tests:
```typescript
it('debug test', async () => {
  const response = await client.blueprints.list();
  console.log('Response:', JSON.stringify(response, null, 2));
});
```

## Performance Considerations

- Tests run sequentially to avoid race conditions
- Each test file creates its own test resources
- Cleanup happens in `afterAll()` hooks
- Use `describe.sequential()` if tests depend on each other
- Consider test data size for batch operations

## Future Enhancements

- [ ] Action execution tests
- [ ] Scorecard evaluation tests
- [ ] Webhook integration tests
- [ ] Real-time update tests
- [ ] Performance benchmarks
- [ ] Load testing suite

## Getting Help

- Check Port.io documentation: https://docs.port.io
- Review smoke tests for manual verification: `smoke-tests/`
- Run unit tests first to isolate SDK issues: `pnpm test`
- Contact Port support for API-specific issues

---

**Note**: Integration tests modify your Port workspace. Always use a development/test workspace, never production!


# Smoke Tests

Quick manual tests to verify the SDK works correctly with real Port API credentials.

## Prerequisites

Create a `.env.local` file in the project root with your Port credentials:

```bash
PORT_CLIENT_ID=your-client-id
PORT_CLIENT_SECRET=your-client-secret
# Optional: PORT_REGION=us  # defaults to eu
```

## Running Tests

### Run all smoke tests:

```bash
pnpm smoke
```

### Run individual smoke tests:

```bash
# Using npm scripts (recommended)
pnpm smoke:service        # Test 'service' blueprint
pnpm smoke:team           # Test '_team' blueprint
pnpm smoke:user           # Test '_user' blueprint
pnpm smoke:scorecard      # Test '_scorecard' blueprint
pnpm smoke:rule           # Test '_rule' blueprint
pnpm smoke:rule-result    # Test '_rule_result' blueprint

# Or directly with tsx
pnpm tsx smoke-tests/01-get-service-blueprint.ts
pnpm tsx smoke-tests/02-get-team-blueprint.ts
# ... etc
```

## What These Tests Do

These smoke tests verify:
- ✅ SDK client initialization
- ✅ Authentication with Port API
- ✅ Blueprint retrieval operations
- ✅ Proper error handling
- ✅ Date transformation
- ✅ Response parsing

## Test Coverage

| Test | Blueprint | Type | Description |
|------|-----------|------|-------------|
| 01 | `service` | Custom | User-defined service blueprint |
| 02 | `_team` | System | Port's team blueprint |
| 03 | `_user` | System | Port's user blueprint |
| 04 | `_scorecard` | System | Port's scorecard evaluation blueprint |
| 05 | `_rule` | System | Port's scorecard rule blueprint |
| 06 | `_rule_result` | System | Port's rule evaluation result blueprint |

## Expected Output

Each test will display:
- Blueprint identifier, title, and description
- Creation and update timestamps
- Number of properties and relations
- Sample property names

## Troubleshooting

**Authentication Failed (401)**
- Check your `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET` in `.env.local`
- Verify credentials are valid in your Port account

**Blueprint Not Found (404)**
- For `service`: This blueprint must exist in your Port account
- For system blueprints (`_team`, `_user`, `_scorecard`, `_rule`, `_rule_result`): These are built-in and should always exist

**Network Errors**
- Check your internet connection
- Verify the Port API is accessible
- If using a proxy, ensure `HTTP_PROXY` is set correctly

## Adding More Tests

To add a new smoke test:

1. Create a new file: `smoke-tests/XX-test-name.ts`
2. Follow the existing pattern
3. Update this README with the new test
4. Use descriptive console output with emojis for clarity


# GitHub Actions Workflows

This directory contains automated workflows for maintaining the Port SDK.

## Workflows

### Daily Automated Workflows

| Workflow | File | Schedule | Purpose |
|----------|------|----------|---------|
| **OpenAPI Sync** | `openapi-sync.yml` | Daily 2 AM UTC | Sync with Port.io API, auto-create PRs |
| **Health Check** | `daily-health-check.yml` | Daily 8 AM UTC | Monitor SDK health, security audits |

### CI/CD Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Build** | `build.yml` | Push, PR | Build verification |
| **Test** | `test.yml` | Push, PR | Test execution |
| **Type Check** | `typecheck.yml` | Push, PR | TypeScript validation |
| **Security** | `security.yml` | Push, PR | Security scanning |

## Documentation

See [Automated Workflows Documentation](../docs/development/AUTOMATED_WORKFLOWS.md) for:
- Detailed workflow explanations
- Troubleshooting guides
- Configuration options
- Best practices

## Quick Reference

### Manual Triggers

```bash
# OpenAPI sync
gh workflow run openapi-sync.yml

# Health check
gh workflow run daily-health-check.yml
```

### View Recent Runs

```bash
gh run list --limit 10
```

### Monitor a Run

```bash
gh run watch
```

## Notifications

- ✅ Automated PRs created for successful API syncs
- ⚠️ Issues created for failures or breaking changes
- 📧 Email notifications for workflow failures

## Maintenance

Workflows are maintained automatically but may need updates for:
- Node.js version changes
- Port.io API URL changes
- New security requirements
- Schedule adjustments

See the [Maintenance section](../docs/development/AUTOMATED_WORKFLOWS.md#7-maintenance) in the documentation.

# GitHub Actions Workflows

Automated CI/CD workflows for the Port SDK.

## Workflows

### 🧪 [test.yml](./test.yml)
**Purpose**: Run unit tests with coverage across multiple Node.js versions

**Triggers**:
- Pull requests to `main` or `dev`
- Pushes to `main` or `dev`

**What it does**:
- Runs unit tests on Node.js 20.x and 22.x
- Generates code coverage reports
- Verifies coverage thresholds (≥68% statements, ≥80% branches)
- Uploads coverage to Codecov
- Uploads coverage artifacts

**Duration**: ~2-3 minutes per Node version (runs in parallel)

---

### 📝 [typecheck.yml](./typecheck.yml)
**Purpose**: TypeScript type checking

**Triggers**:
- Pull requests to `main` or `dev`
- Pushes to `main` or `dev`

**What it does**:
- Runs `tsc --noEmit` to check types
- Verifies type compatibility with `pnpm types:check`

**Duration**: ~30-45 seconds

---

### 🔒 [security.yml](./security.yml)
**Purpose**: Security vulnerability scanning

**Triggers**:
- Pull requests to `main` or `dev`
- Pushes to `main` or `dev`
- Weekly schedule (Mondays at 9 AM UTC)

**What it does**:
- Runs `pnpm audit --prod` (production dependencies only)
- Uses moderate severity threshold
- **Excludes devDependencies** (only used in development, not in published package)
- Generates audit report if vulnerabilities found
- Uploads audit report as artifact on failure

**Duration**: ~30-45 seconds

**Note**: DevDependencies are intentionally excluded because they don't affect the published package that users install.

---

### 📦 [build.yml](./build.yml)
**Purpose**: Build verification and package validation

**Triggers**:
- Pull requests to `main` or `dev`
- Pushes to `main` or `dev`

**What it does**:
- Builds the package with `pnpm build`
- Verifies required output files exist
- Tests package creation with `npm pack`
- Checks package size and warns if >200KB

**Duration**: ~1 minute

---

## Workflow Architecture

All workflows run **in parallel** for maximum efficiency:

```
PR/Push Trigger
    ├── test.yml       (2-3 min, parallel across Node versions)
    ├── typecheck.yml  (30-45 sec)
    ├── security.yml   (30-45 sec)
    └── build.yml      (1 min)
    
Total: ~3 minutes (everything runs in parallel)
```

### Benefits of Separate Workflows

1. **Parallel Execution**: All checks run simultaneously
2. **Faster Feedback**: Know which specific check failed
3. **Independent Re-runs**: Re-run only failed workflows
4. **Better Resource Usage**: Optimize GitHub Actions minutes
5. **Clearer Status**: Each workflow has its own status badge

## Status Badges

Add these to your README.md:

```markdown
[![Tests](https://github.com/port-labs/port-js-sdk/actions/workflows/test.yml/badge.svg)](https://github.com/port-labs/port-js-sdk/actions/workflows/test.yml)
[![Type Check](https://github.com/port-labs/port-js-sdk/actions/workflows/typecheck.yml/badge.svg)](https://github.com/port-labs/port-js-sdk/actions/workflows/typecheck.yml)
[![Security](https://github.com/port-labs/port-js-sdk/actions/workflows/security.yml/badge.svg)](https://github.com/port-labs/port-js-sdk/actions/workflows/security.yml)
[![Build](https://github.com/port-labs/port-js-sdk/actions/workflows/build.yml/badge.svg)](https://github.com/port-labs/port-js-sdk/actions/workflows/build.yml)
```

## Caching Strategy

All workflows use pnpm store caching for faster installs:

```yaml
- name: Get pnpm store directory
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

**Cache hit**: Install takes ~10 seconds  
**Cache miss**: Install takes ~30-45 seconds

## Required Secrets

None required for basic workflows.

### Optional Secrets

For advanced features, configure these in repository settings:

- `CODECOV_TOKEN` - For Codecov integration (optional, works without)
- `NPM_TOKEN` - For publishing workflow (when added)

## Troubleshooting

### Workflow Fails on `pnpm install`

**Issue**: Lock file out of sync

**Solution**:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lock file"
```

### Coverage Threshold Failure

**Issue**: New code reduced coverage below threshold

**Solution**:
```bash
# Check coverage locally
pnpm test:coverage

# Add tests to meet threshold
# Or adjust thresholds in vitest.config.ts
```

### Type Check Failure

**Issue**: TypeScript errors in code

**Solution**:
```bash
# Check types locally
pnpm type-check

# Fix type errors
```

### Security Audit Failure

**Issue**: Vulnerable dependencies detected

**Solution**:
```bash
# Check locally
pnpm audit

# Try automatic fix
pnpm audit fix

# Or update specific packages
pnpm update [package-name]
```

## Local Testing

Test workflows locally before pushing:

```bash
# Run all checks locally
pnpm type-check && pnpm test:coverage && pnpm build

# Run security audit
pnpm audit

# Test package creation
npm pack --dry-run
```

## Maintenance

### Adding New Workflows

1. Create new workflow file in `.github/workflows/`
2. Follow existing naming convention
3. Include caching for faster runs
4. Update this README
5. Add status badge to main README

### Updating Node.js Versions

Update the matrix in `test.yml`:

```yaml
strategy:
  matrix:
    node-version: [20.x, 22.x, 24.x]  # Add new versions here
```

### Adjusting Coverage Thresholds

Update both:
1. `vitest.config.ts` - For local testing
2. `test.yml` - For CI checks

Keep them in sync!

## Future Enhancements

Potential additional workflows:

- [ ] `integration.yml` - Integration tests with real API
- [ ] `release.yml` - Automated releases with semantic-release
- [ ] `docs.yml` - Deploy API documentation to GitHub Pages
- [ ] `benchmarks.yml` - Performance benchmarking
- [ ] `bundle-size.yml` - Track bundle size changes

---

**Note**: All workflows are optimized for speed and cost-effectiveness. Average PR takes ~3 minutes for all checks to complete.


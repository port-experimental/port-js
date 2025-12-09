# Publish Workflow Fixes

**Date:** December 9, 2025  
**Issue:** Release workflow failing with permission errors

## Issues Identified

### 1. Missing Permission for Issue Creation ❌
**Error:** `HttpError: Resource not accessible by integration`

**Root Cause:** The workflow was trying to create a GitHub issue on publish failure, but the `GITHUB_TOKEN` didn't have `issues: write` permission.

**Fix:** Added `issues: write` to the workflow permissions:
```yaml
permissions:
  contents: write
  id-token: write  # Required for npm provenance
  issues: write  # Required to create issues on publish failure
```

### 2. Version Update Step Failing ❌
**Error:** `Process completed with exit code 1`

**Root Cause:** The `npm version` command might fail if:
- Version format is invalid
- Version already matches current version
- npm command fails for other reasons

**Fix:** Enhanced the version update step with:
- Better error handling with fallback to manual package.json update
- Version format validation (semver)
- Check if version is already set (skip unnecessary update)
- More detailed error messages

### 3. Issue Creation Step Failing ❌
**Root Cause:** Even with permissions, the issue creation could fail and break the workflow.

**Fix:** Added:
- `continue-on-error: true` to prevent workflow failure
- Better error handling with try/catch
- Explicit `github-token` parameter
- More detailed error logging

## Additional Improvements

### 4. npm Authentication Verification ✅
Added a step to verify npm authentication before attempting to publish:
- Checks if `NPM_TOKEN` secret is set
- Verifies token validity with `npm whoami`
- Provides clear error messages if authentication fails

### 5. Version Existence Check ✅
Added a step to check if the version already exists on npm:
- Prevents duplicate version errors
- Provides clear feedback if version exists
- Fails early with helpful message

### 6. Enhanced Error Messages ✅
Improved error messages throughout:
- Version format validation with examples
- npm publish failure with common issues list
- Better debugging information

## Verification Checklist

Before running the publish workflow, ensure:

- [ ] **NPM_TOKEN secret is configured** in repository settings
  - Go to: Settings > Secrets and variables > Actions
  - Add secret: `NPM_TOKEN` with your npm access token
  - Token must have publish permissions for `@port-experimental` scope

- [ ] **Version format is valid** (semver: `x.y.z` or `x.y.z-prerelease`)
  - Examples: `0.2.5`, `1.0.0-beta.1`, `2.0.0-rc.1`

- [ ] **Version doesn't already exist** on npm
  - Check: `npm view @port-experimental/port-sdk@<version>`
  - If exists, use a different version

- [ ] **All tests pass** locally
  ```bash
  pnpm test
  pnpm type-check
  pnpm build
  ```

- [ ] **No security vulnerabilities**
  ```bash
  pnpm audit --audit-level=high
  ```

## Testing the Fixes

### Test Workflow Locally

1. **Dry Run Test:**
   ```bash
   # Trigger workflow manually with dry_run=true
   # This will test all steps without publishing
   ```

2. **Check Permissions:**
   - Verify workflow has `issues: write` permission
   - Check that `NPM_TOKEN` secret is set

3. **Test Version Update:**
   ```bash
   # Test version update logic
   VERSION="0.2.6"
   npm version $VERSION --no-git-tag-version
   node -p "require('./package.json').version"  # Should match $VERSION
   ```

## Common Failure Scenarios

### Scenario 1: npm Authentication Failed
**Symptoms:**
- Error: `npm ERR! code E401`
- Error: `You must be logged in to publish packages`

**Solution:**
1. Check `NPM_TOKEN` secret is set in repository settings
2. Verify token has publish permissions
3. Regenerate token if needed: https://www.npmjs.com/settings/port-experimental/tokens

### Scenario 2: Version Already Exists
**Symptoms:**
- Error: `You cannot publish over the previously published versions`

**Solution:**
1. Check existing versions: `npm view @port-experimental/port-sdk versions`
2. Use a different version number
3. Or unpublish if it was a mistake (requires npm support)

### Scenario 3: Permission Denied
**Symptoms:**
- Error: `Resource not accessible by integration`
- Error: `403 Forbidden`

**Solution:**
1. Verify workflow has required permissions
2. Check repository settings > Actions > General > Workflow permissions
3. Ensure "Read and write permissions" is enabled

### Scenario 4: Version Format Invalid
**Symptoms:**
- Error: `Invalid version format`
- Error: `npm version` command fails

**Solution:**
1. Use valid semver format: `MAJOR.MINOR.PATCH` or `MAJOR.MINOR.PATCH-prerelease`
2. Examples: `1.2.3`, `0.2.5-beta.1`, `2.0.0-rc.2`
3. Avoid: `v1.2.3` (no 'v' prefix), `1.2` (missing patch)

## Manual Publish (If Workflow Fails)

If the automated workflow fails, you can publish manually:

```bash
# 1. Set version
VERSION="0.2.6"
npm version $VERSION --no-git-tag-version

# 2. Verify
pnpm type-check
pnpm test
pnpm build

# 3. Publish
npm publish --access public --tag latest

# 4. Verify published
npm view @port-experimental/port-sdk@$VERSION
```

## Next Steps

1. ✅ **Fixed:** Added `issues: write` permission
2. ✅ **Fixed:** Enhanced version update step with error handling
3. ✅ **Fixed:** Improved issue creation with error handling
4. ✅ **Added:** npm authentication verification
5. ✅ **Added:** Version existence check
6. ✅ **Added:** Better error messages

## References

- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)

---

**Last Updated:** December 9, 2025


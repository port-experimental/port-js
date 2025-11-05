## Security Fixes

### Fixed
- **Security**: Replaced deprecated `.substr()` method with `.slice()` in HTTP client request ID generation (3 instances)
  - Prevents potential issues with deprecated JavaScript API
  - Updated in `src/http-client.ts` lines 261, 505, 520
- **Security**: Added URL encoding for all identifiers in EntityResource paths
  - Prevents potential path traversal vulnerabilities
  - Ensures proper URL encoding for blueprint identifiers, entity identifiers, and relation names
  - Updated methods: `create()`, `get()`, `update()`, `delete()`, `list()`, `getRelated()`
  - Aligns EntityResource with other resources (Teams, Users, Webhooks) which already use URL encoding

### Changed
- Improved URL safety by consistently applying `encodeURIComponent()` to all user-provided identifiers in entity operations


# Port SDK - Missing Features TODO List

**Generated:** December 9, 2025 
**Based on:** OpenAPI Schema (`src/types/api.ts`) 
**Current Coverage:** 9/15 resources (60%)

--- ## Summary

### Current Implementation Status
- [OK] **Fully Implemented Resources:** 9
 - Actions, Action Runs, Audit Logs, Blueprints, Entities, Scorecards, Teams, Users, Webhooks
- [ERROR] **Missing Resources:** 6
 - Integrations, Organization, Apps, Pages, Migrations, Authentication
- [WARNING] **Partially Implemented:** Multiple resources missing advanced operations

### Priority Breakdown
- **HIGH:** 1 resource (Integrations)
- **MEDIUM:** 2 resources (Organization, Apps)
- **ENHANCEMENT:** 10 missing operations in existing resources
- **LOW:** 3 resources (Pages, Migrations, Auth)

--- ## HIGH PRIORITY - New Resources

### 1. Integrations Resource
**Why:** Core functionality for data ingestion from external sources (AWS, GCP, Kubernetes, GitHub, etc.)

**Endpoints to Implement:**
- `GET /v1/integration` - List all integrations (with optional `actionsProcessingEnabled` filter)
- `GET /v1/integration/{identifier}` - Get integration details (with optional `byField` query param)
- `PATCH /v1/integration/{identifier}` - Update integration (supports resync by sending empty body)
- `DELETE /v1/integration/{identifier}` - Delete integration
- `PATCH /v1/integration/{identifier}/config` - Update integration config only
- `GET /v1/integration/{identifier}/logs` - Get integration sync logs (with pagination, timestamp filtering)

**Resource Structure:**
```typescript
class IntegrationResource {
 async list(options?: { actionsProcessingEnabled?: boolean }): Promise<Integration[]>
 async get(identifier: string, options?: { byField?: 'installationId' | 'logIngestId' }): Promise<Integration>
 async update(identifier: string, data: UpdateIntegrationInput): Promise<Integration>
 async delete(identifier: string): Promise<void>
 async updateConfig(identifier: string, config: IntegrationConfig): Promise<Integration>
 async getLogs(identifier: string, options?: IntegrationLogOptions): Promise<IntegrationLog[]>
 async resync(identifier: string): Promise<Integration> // Helper: update with empty body
}
```

**Files to Create:**
- `src/resources/integrations.ts`
- `src/types/integrations.ts`
- `tests/unit/resources/integrations.test.ts`
- `examples/26-integrations.ts`

**Effort:** 3-4 days

--- ## MEDIUM PRIORITY - New Resources

### 2. Organization Resource
**Why:** Essential for organization-wide settings and secrets management

**Endpoints to Implement:**
- `GET /v1/organization` - Get organization settings
- `PATCH /v1/organization` - Update organization settings
- `GET /v1/organization/secrets` - List organization secrets
- `POST /v1/organization/secrets` - Create secret
- `PATCH /v1/organization/secrets/{secret_name}` - Update secret
- `DELETE /v1/organization/secrets/{secret_name}` - Delete secret

**Resource Structure:**
```typescript
class OrganizationResource {
 async get(): Promise<Organization>
 async update(data: UpdateOrganizationInput): Promise<Organization>
 
 readonly secrets: {
 list(): Promise<OrganizationSecret[]>
 create(data: CreateSecretInput): Promise<OrganizationSecret>
 update(name: string, data: UpdateSecretInput): Promise<OrganizationSecret>
 delete(name: string): Promise<void>
 }
}
```

**Files to Create:**
- `src/resources/organization.ts`
- `src/types/organization.ts`
- `tests/unit/resources/organization.test.ts`
- `examples/27-organization-management.ts`

**Effort:** 2-3 days

--- ### 3. Apps Resource
**Why:** Manage Port app installations and configurations

**Endpoints to Implement:**
- `GET /v1/apps` - List installed apps
- `GET /v1/apps/{id}` - Get app details
- `DELETE /v1/apps/{id}` - Uninstall app
- `POST /v1/apps/{id}/rotate-secret` - Rotate app credentials

**Resource Structure:**
```typescript
class AppResource {
 async list(): Promise<App[]>
 async get(id: string): Promise<App>
 async delete(id: string): Promise<void>
 async rotateSecret(id: string): Promise<AppSecret>
}
```

**Files to Create:**
- `src/resources/apps.ts`
- `src/types/apps.ts`
- `tests/unit/resources/apps.test.ts`
- `examples/28-app-management.ts`

**Effort:** 2 days

--- ## ENHANCEMENTS - Missing Operations in Existing Resources

### 4. Blueprint Resource Enhancements

#### 4.1 Permissions Management
- `GET /v1/blueprints/{blueprint_identifier}/permissions` - Get blueprint permissions
- `PATCH /v1/blueprints/{blueprint_identifier}/permissions` - Update blueprint permissions

**Add to BlueprintResource:**
```typescript
async getPermissions(identifier: string): Promise<BlueprintPermissions>
async updatePermissions(identifier: string, permissions: BlueprintPermissions): Promise<void>
```

#### 4.2 Bulk Entity Operations
- `POST /v1/blueprints/{blueprint_identifier}/entities/bulk` - Bulk create/update entities
- `POST /v1/blueprints/{blueprint_identifier}/bulk/entities/delete` - Bulk delete entities
- `GET /v1/blueprints/{blueprint_identifier}/all-entities` - Get all entities (no pagination)
- `GET /v1/blueprints/{blueprint_identifier}/entities-count` - Count entities

**Add to BlueprintResource:**
```typescript
async bulkCreateEntities(blueprint: string, entities: CreateEntityInput[]): Promise<Entity[]>
async bulkDeleteEntities(blueprint: string, identifiers: string[]): Promise<void>
async getAllEntities(blueprint: string): Promise<Entity[]>
async getEntitiesCount(blueprint: string, filters?: SearchQuery): Promise<number>
```

#### 4.3 Rename Operations
- `PATCH /v1/blueprints/{blueprint_identifier}/properties/{property_identifier}/rename` - Rename property
- `PATCH /v1/blueprints/{blueprint_identifier}/relations/{relation_identifier}/rename` - Rename relation
- `PATCH /v1/blueprints/{blueprint_identifier}/mirror/{property_identifier}/rename` - Rename mirror property

**Add to BlueprintResource:**
```typescript
async renameProperty(blueprint: string, oldName: string, newName: string): Promise<Blueprint>
async renameRelation(blueprint: string, oldName: string, newName: string): Promise<Blueprint>
async renameMirror(blueprint: string, oldName: string, newName: string): Promise<Blueprint>
```

#### 4.4 Blueprint Actions Management
- `GET /v1/blueprints/{blueprint_identifier}/actions` - List actions for blueprint
- `POST /v1/blueprints/{blueprint_identifier}/actions` - Create action for blueprint
- `GET /v1/blueprints/{blueprint_identifier}/actions/{action_identifier}` - Get blueprint action
- `PATCH /v1/blueprints/{blueprint_identifier}/actions/{action_identifier}` - Update blueprint action
- `DELETE /v1/blueprints/{blueprint_identifier}/actions/{action_identifier}` - Delete blueprint action

**Add to BlueprintResource:**
```typescript
readonly actions: {
 list(blueprint: string): Promise<Action[]>
 create(blueprint: string, data: CreateActionInput): Promise<Action>
 get(blueprint: string, actionIdentifier: string): Promise<Action>
 update(blueprint: string, actionIdentifier: string, data: UpdateActionInput): Promise<Action>
 delete(blueprint: string, actionIdentifier: string): Promise<void>
}
```

**Effort:** 3-4 days total

--- ### 5. Entity Resource Enhancements

#### 5.1 Analytics Operations
- `GET /v1/entities/aggregate` - Aggregate queries
- `GET /v1/entities/aggregate-over-time` - Time-series aggregations
- `GET /v1/entities/properties-history` - Property history tracking

**Add to EntityResource:**
```typescript
async aggregate(query: AggregateQuery): Promise<AggregateResult>
async aggregateOverTime(query: TimeSeriesQuery): Promise<TimeSeriesResult[]>
async getPropertyHistory(
 blueprint: string,
 identifier: string,
 property: string,
 options?: HistoryOptions
): Promise<PropertyHistory[]>
```

#### 5.2 Blueprint-Specific Entity Operations
- `GET /v1/blueprints/{blueprint_identifier}/entities/search` - Search entities within blueprint
- `GET /v1/blueprints/{blueprint_identifier}/all-entities` - Get all entities (no pagination)
- `GET /v1/blueprints/{blueprint_identifier}/entities-count` - Count entities

**Note:** Some of these may already be covered, but need to verify implementation.

**Effort:** 2-3 days

--- ### 6. Action Resource Enhancements

#### 6.1 Permissions Management
- `GET /v1/actions/{action_identifier}/permissions` - Get action permissions
- `PATCH /v1/actions/{action_identifier}/permissions` - Update action permissions

**Add to ActionResource:**
```typescript
async getPermissions(identifier: string): Promise<ActionPermissions>
async updatePermissions(identifier: string, permissions: ActionPermissions): Promise<void>
```

**Effort:** 1 day

--- ### 7. Action Run Resource Enhancements

#### 7.1 Approvers Management
- `GET /v1/actions/runs/{run_id}/approvers` - Get action run approvers

**Add to ActionRunResource:**
```typescript
async getApprovers(runId: string): Promise<ActionRunApprover[]>
```

**Effort:** 0.5 days

--- ### 8. User Resource Enhancements

#### 8.1 Credential Rotation
- `POST /v1/rotate-credentials/{user_email}` - Rotate user credentials

**Add to UserResource:**
```typescript
async rotateCredentials(email: string): Promise<UserCredentials>
```

**Effort:** 0.5 days

--- ## LOW PRIORITY - New Resources

### 9. Pages Resource
**Why:** Custom dashboards and portal pages (UI-focused, less critical for API automation)

**Endpoints to Implement:**
- `GET /v1/pages` - List pages
- `POST /v1/pages` - Create page
- `GET /v1/pages/{identifier}` - Get page
- `PATCH /v1/pages/{identifier}` - Update page
- `DELETE /v1/pages/{identifier}` - Delete page
- `PUT /v1/pages/{page_identifier}/permissions` - Update permissions
- `GET /v1/pages/{page_identifier}/widgets` - List widgets
- `POST /v1/pages/{page_identifier}/widgets` - Create widget
- `PATCH /v1/pages/{page_identifier}/widgets/{widget_id}` - Update widget
- `DELETE /v1/pages/{page_identifier}/widgets/{widget_id}` - Delete widget

**Resource Structure:**
```typescript
class PageResource {
 async list(): Promise<Page[]>
 async create(data: CreatePageInput): Promise<Page>
 async get(identifier: string): Promise<Page>
 async update(identifier: string, data: UpdatePageInput): Promise<Page>
 async delete(identifier: string): Promise<void>
 async updatePermissions(identifier: string, permissions: PagePermissions): Promise<void>
 
 readonly widgets: {
 list(pageIdentifier: string): Promise<Widget[]>
 create(pageIdentifier: string, data: CreateWidgetInput): Promise<Widget>
 update(pageIdentifier: string, widgetId: string, data: UpdateWidgetInput): Promise<Widget>
 delete(pageIdentifier: string, widgetId: string): Promise<void>
 }
}
```

**Effort:** 4-5 days (complex with nested widgets)

--- ### 10. Migrations Resource
**Why:** Bulk data transformations (occasional use)

**Endpoints to Implement:**
- `GET /v1/migrations` - List migrations
- `POST /v1/migrations` - Create migration
- `GET /v1/migrations/{migration_id}` - Get migration status
- `POST /v1/migrations/{migration_id}/cancel` - Cancel migration

**Resource Structure:**
```typescript
class MigrationResource {
 async list(): Promise<Migration[]>
 async create(data: CreateMigrationInput): Promise<Migration>
 async get(migrationId: string): Promise<Migration>
 async cancel(migrationId: string): Promise<void>
}
```

**Effort:** 2 days

--- ### 11. Authentication Resource
**Why:** Token management (though OAuth is handled in HttpClient, this endpoint may be useful)

**Endpoints to Implement:**
- `POST /v1/auth/access_token` - Get access token

**Note:** This may be redundant with existing OAuth flow in HttpClient, but could be useful for custom token management.

**Effort:** 1 day (if needed)

--- ## Implementation Checklist Template

For each feature, follow this checklist:

### Planning
- [ ] Review OpenAPI specification for endpoint
- [ ] Define TypeScript types in `src/types/{resource}.ts`
- [ ] Plan resource methods and signatures
- [ ] Identify edge cases and error scenarios

### Implementation
- [ ] Create resource class in `src/resources/{resource}.ts`
- [ ] Implement all CRUD methods
- [ ] Add proper error handling
- [ ] Add JSDoc comments with examples
- [ ] Export from `src/index.ts`
- [ ] Add to `PortClient` class

### Testing
- [ ] Write unit tests (`tests/unit/resources/{resource}.test.ts`)
- [ ] Create integration test (`tests/integration/{resource}.integration.test.ts`)
- [ ] Test against real API (manual verification)

### Documentation
- [ ] Create example file (`examples/XX-{resource}.ts`)
- [ ] Update `examples/README.md`
- [ ] Update `README.md` if user-facing
- [ ] Update `CHANGELOG.md`
- [ ] Generate TypeDoc: `pnpm docs:generate`

### Review
- [ ] Code review
- [ ] Type check passes (`pnpm type-check`)
- [ ] All tests pass (`pnpm test`)
- [ ] Examples run successfully
- [ ] Documentation is clear and accurate
- [ ] No linter errors

--- ## Recommended Implementation Order

### Phase 1: Critical Features (Week 1-2)
1. [OK] Integrations Resource (HIGH PRIORITY)
2. [OK] Organization Resource (MEDIUM PRIORITY)

### Phase 2: Core Enhancements (Week 3-4)
3. [OK] Blueprint Permissions & Bulk Operations
4. [OK] Entity Analytics Operations
5. [OK] Action Permissions

### Phase 3: Additional Resources (Week 5-6)
6. [OK] Apps Resource
7. [OK] Blueprint Rename Operations
8. [OK] Action Run Approvers & User Credential Rotation

### Phase 4: Low Priority (Week 7-8)
9. [OK] Pages Resource
10. [OK] Migrations Resource
11. [OK] Authentication Resource (if needed)

--- ## Progress Tracking

### Resources
- [ ] Integrations (0/6 endpoints)
- [ ] Organization (0/6 endpoints)
- [ ] Apps (0/4 endpoints)
- [ ] Pages (0/10 endpoints)
- [ ] Migrations (0/4 endpoints)
- [ ] Authentication (0/1 endpoint)

### Enhancements
- [ ] Blueprint Permissions (0/2)
- [ ] Blueprint Bulk Operations (0/4)
- [ ] Blueprint Rename Operations (0/3)
- [ ] Blueprint Actions Management (0/5)
- [ ] Entity Analytics (0/3)
- [ ] Action Permissions (0/2)
- [ ] Action Run Approvers (0/1)
- [ ] User Credential Rotation (0/1)

--- ## Notes

- All endpoints are based on the latest OpenAPI schema in `src/types/api.ts`
- Some endpoints may have query parameters, request body schemas, or response types that need careful review
- Consider backward compatibility when adding new methods to existing resources
- Follow the existing patterns in `src/resources/` for consistency
- Ensure all new features have proper TypeScript types and JSDoc documentation

--- **Last Updated:** December 9, 2025 
**Next Review:** After each major feature implementation


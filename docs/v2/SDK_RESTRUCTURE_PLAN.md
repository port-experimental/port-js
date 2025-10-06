# SDK Restructure Plan: Align with Pulumi Provider Pattern

## Executive Summary

This document outlines a plan to restructure the Port TypeScript SDK to match the developer-friendly patterns established by the [Port Pulumi Provider](https://github.com/port-labs/pulumi-port) and successfully implemented in the beskar-protocol project.

**Goal**: Make the SDK's API surface match the Pulumi provider's structure so developers can easily copy patterns between Pulumi (IaC) and the SDK (programmatic access).

## Current State vs. Target State

### 1. Blueprint Properties

#### ❌ Current State (SDK)

```typescript
const blueprint = await client.blueprints.create({
  identifier: 'service',
  title: 'Service',
  schema: {
    properties: {
      name: {  // Flat, untyped structure
        type: 'string',
        title: 'Service Name',
        description: 'Name of the service'
      },
      port: {
        type: 'number',
        title: 'Port Number'
      },
      isActive: {
        type: 'boolean',
        title: 'Is Active'
      }
    }
  }
});
```

**Problems**:
- Flat `Record<string, BlueprintProperty>` - no type grouping
- Developers must remember to set `type` for each property
- No IntelliSense guidance for property types
- Different pattern from entities (which already use typed groups)

#### ✅ Target State (like Pulumi)

```typescript
const blueprint = await client.blueprints.create({
  identifier: 'service',
  title: 'Service',
  properties: {
    stringProps: {
      name: {
        title: 'Service Name',
        description: 'Name of the service'
      },
      environment: {
        title: 'Environment',
        description: 'Deployment environment',
        enums: ['production', 'staging', 'development']
      }
    },
    numberProps: {
      port: {
        title: 'Port Number',
        description: 'Port where service runs'
      },
      uptime: {
        title: 'Uptime Percentage'
      }
    },
    booleanProps: {
      isActive: {
        title: 'Is Active',
        description: 'Whether the service is currently active'
      },
      hasMonitoring: {
        title: 'Has Monitoring'
      }
    },
    arrayProps: {
      tags: {
        title: 'Tags',
        description: 'Tags for categorization'
      },
      dependencies: {
        title: 'Dependencies',
        description: 'List of service dependencies'
      }
    }
  }
});
```

**Benefits**:
- Type safety at the property group level
- No need to specify `type` - it's implicit from the group
- Better IntelliSense and autocomplete
- Matches entity pattern (consistency)
- Matches Pulumi pattern (easy copy-paste)

### 2. Entity Properties

#### ✅ Current State (ALREADY CORRECT)

```typescript
const entity = await client.entities.create({
  identifier: 'my-service',
  blueprint: 'service',
  properties: {
    stringProps: {
      name: 'My Service',
      environment: 'production'
    },
    numberProps: {
      port: 3000,
      uptime: 99.9
    },
    booleanProps: {
      isActive: true,
      hasMonitoring: true
    }
  },
  relations: {
    singleRelations: {
      owner: 'alice@company.com',
      team: 'backend-team'
    },
    manyRelations: {
      dependencies: ['service-a', 'service-b'],
      vulnerabilities: ['vuln-001']
    }
  }
});
```

**Status**: ✅ **No changes needed** - entities already use the correct pattern!

### 3. Actions

#### Current State (SDK)

```typescript
// Basic action support exists
const action = await client.actions.create({
  identifier: 'deploy-service',
  title: 'Deploy Service',
  blueprint: 'service',
  trigger: {
    type: 'self-service',
    operation: 'CREATE'
  }
});
```

#### Target State (Pulumi-like)

```typescript
const action = await client.actions.create({
  identifier: 'auto_assign_vulnerability',
  title: 'Auto-Assign Vulnerability',
  description: 'Automatically assigns vulnerabilities to service owners',
  
  // Automation trigger with JQ conditions
  automationTrigger: {
    entityCreatedEvent: {
      blueprintIdentifier: 'vulnerability'
    },
    jqCondition: {
      expressions: [
        '.entity.relations.services | length > 0',
        '.entity.relations.assignedTo == null'
      ],
      combinator: 'and'
    }
  },
  
  // Upsert entity method for automation
  upsertEntityMethod: {
    blueprintIdentifier: 'vulnerability',
    mapping: {
      identifier: '{{.entity.identifier}}',
      relations: {
        assignedTo: '{{ .entity.relations.services[0] | .owner }}',
        team: '{{ .entity.relations.services[0] | .team }}'
      }
    }
  }
});
```

**Gaps**:
- Need `automationTrigger` with `entityCreatedEvent`/`entityUpdatedEvent`
- Need `jqCondition` support with `expressions` and `combinator`
- Need `upsertEntityMethod` with template mapping support

### 4. Scorecards

#### Current State (SDK)

```typescript
const scorecard = await client.scorecards.create({
  identifier: 'security-scorecard',
  title: 'Security Scorecard',
  blueprint: 'service',
  rules: [
    {
      identifier: 'has-security-scanning',
      title: 'Has Security Scanning',
      level: 'Gold',
      query: {
        property: 'hasSecurityScanning',
        operator: '=',
        value: true
      }
    }
  ]
});
```

#### Target State (Pulumi-like)

```typescript
const scorecard = await client.scorecards.create({
  identifier: 'security-scorecard',
  title: 'Security Scorecard',
  blueprint: 'service',
  rules: [
    {
      identifier: 'has-security-scanning',
      title: 'Has Security Scanning',
      level: 'Gold',
      description: 'Service has automated security scanning enabled',
      query: {
        combinator: 'and',
        conditions: [
          {
            property: 'hasSecurityScanning',
            operator: '=',
            value: true
          },
          {
            property: 'hasDependencyScanning',
            operator: '=',
            value: true
          }
        ]
      }
    }
  ]
});
```

**Gaps**:
- Need `combinator` support for complex queries
- Need `conditions` array instead of single rule
- Need better support for nested query logic

## Implementation Strategy

### Phase 1: Type System Updates (Breaking Changes)

**Priority**: HIGH  
**Effort**: 3-5 days  
**Risk**: HIGH (breaking change)

#### Tasks:

1. **Update Blueprint Types** (`src/types/blueprints.ts`):
   ```typescript
   // OLD
   export interface BlueprintSchema {
     properties?: Record<string, BlueprintProperty>;
     required?: string[];
   }
   
   // NEW
   export interface BlueprintSchema {
     properties?: BlueprintSchemaProperties;
     required?: string[];
   }
   
   export interface BlueprintSchemaProperties {
     stringProps?: Record<string, BlueprintProperty>;
     numberProps?: Record<string, BlueprintProperty>;
     booleanProps?: Record<string, BlueprintProperty>;
     arrayProps?: Record<string, BlueprintProperty>;
     objectProps?: Record<string, BlueprintProperty>;
   }
   
   // Enhance BlueprintProperty
   export interface BlueprintProperty {
     title?: string;
     description?: string;
     enums?: string[];            // Add enums support
     enumColors?: Record<string, string>;  // Add enum colors
     format?: BlueprintPropertyFormat | string;
     items?: BlueprintProperty;
     properties?: Record<string, BlueprintProperty>;
     icon?: string;
     spec?: string;
     specAuthentication?: Record<string, unknown>;
     default?: unknown;
   }
   ```

2. **Update Action Types** (`src/types/actions.ts`):
   ```typescript
   export interface ActionAutomationTrigger {
     entityCreatedEvent?: {
       blueprintIdentifier: string;
     };
     entityUpdatedEvent?: {
       blueprintIdentifier: string;
     };
     entityDeletedEvent?: {
       blueprintIdentifier: string;
     };
     timerPropertyExpired?: {
       blueprintIdentifier: string;
       propertyIdentifier: string;
     };
     jqCondition?: {
       expressions: string[];
       combinator: 'and' | 'or';
     };
   }
   
   export interface ActionUpsertEntityMethod {
     blueprintIdentifier: string;
     mapping: {
       identifier: string;
       title?: string;
       properties?: Record<string, unknown>;
       relations?: Record<string, unknown>;
     };
   }
   ```

3. **Update Scorecard Types** (`src/types/scorecards.ts`):
   ```typescript
   export interface ScorecardRuleQuery {
     combinator?: 'and' | 'or';
     conditions?: ScorecardQueryCondition[];
   }
   
   export interface ScorecardQueryCondition {
     property: string;
     operator: string;
     value?: unknown;
   }
   ```

### Phase 2: Transformation Layer (No Breaking Changes)

**Priority**: HIGH  
**Effort**: 2-3 days  
**Risk**: MEDIUM

Create bidirectional transformers to convert between SDK types and API types:

```typescript
// src/utils/transformers/blueprint-transformer.ts

export class BlueprintTransformer {
  /**
   * Transform SDK's typed properties to API's flat properties
   */
  static toApiFormat(properties: BlueprintSchemaProperties): Record<string, ApiBlueprintProperty> {
    const flat: Record<string, ApiBlueprintProperty> = {};
    
    // Transform stringProps
    if (properties.stringProps) {
      for (const [key, prop] of Object.entries(properties.stringProps)) {
        flat[key] = { type: 'string', ...prop };
      }
    }
    
    // Transform numberProps
    if (properties.numberProps) {
      for (const [key, prop] of Object.entries(properties.numberProps)) {
        flat[key] = { type: 'number', ...prop };
      }
    }
    
    // Transform booleanProps
    if (properties.booleanProps) {
      for (const [key, prop] of Object.entries(properties.booleanProps)) {
        flat[key] = { type: 'boolean', ...prop };
      }
    }
    
    // Transform arrayProps
    if (properties.arrayProps) {
      for (const [key, prop] of Object.entries(properties.arrayProps)) {
        flat[key] = { type: 'array', ...prop };
      }
    }
    
    return flat;
  }
  
  /**
   * Transform API's flat properties to SDK's typed properties
   */
  static fromApiFormat(flat: Record<string, ApiBlueprintProperty>): BlueprintSchemaProperties {
    const typed: BlueprintSchemaProperties = {
      stringProps: {},
      numberProps: {},
      booleanProps: {},
      arrayProps: {}
    };
    
    for (const [key, prop] of Object.entries(flat)) {
      const { type, ...rest } = prop;
      
      switch (type) {
        case 'string':
        case 'url':
        case 'email':
        case 'user':
        case 'team':
        case 'datetime':
        case 'timer':
          typed.stringProps![key] = rest;
          break;
        case 'number':
          typed.numberProps![key] = rest;
          break;
        case 'boolean':
          typed.booleanProps![key] = rest;
          break;
        case 'array':
          typed.arrayProps![key] = rest;
          break;
        case 'object':
          typed.objectProps = typed.objectProps || {};
          typed.objectProps[key] = rest;
          break;
      }
    }
    
    return typed;
  }
}
```

### Phase 3: Resource Updates

**Priority**: HIGH  
**Effort**: 2-3 days  
**Risk**: MEDIUM

Update `BlueprintResource` to use the transformer:

```typescript
// src/resources/blueprints.ts

async create(data: CreateBlueprintInput): Promise<Blueprint> {
  this.validateCreateInput(data);
  
  // Transform typed properties to flat API format
  const apiPayload = {
    ...data,
    schema: data.schema ? {
      properties: BlueprintTransformer.toApiFormat(data.schema.properties!),
      required: data.schema.required
    } : undefined
  };
  
  const response = await this.httpClient.post<ApiBlueprintResponse>(
    this.basePath,
    apiPayload
  );
  
  // Transform flat API response back to typed format
  const blueprint = response.blueprint;
  if (blueprint.schema?.properties) {
    blueprint.schema.properties = BlueprintTransformer.fromApiFormat(
      blueprint.schema.properties
    );
  }
  
  return this.transformBlueprint(blueprint);
}
```

### Phase 4: Backward Compatibility

**Priority**: MEDIUM  
**Effort**: 2 days  
**Risk**: LOW

Support both old and new formats during transition:

```typescript
export interface CreateBlueprintInput {
  identifier: string;
  title?: string;
  icon?: string;
  schema?: BlueprintSchema | LegacyBlueprintSchema;  // Support both
}

// Helper to detect format
function isTypedSchema(schema: any): schema is BlueprintSchema {
  return (
    'stringProps' in (schema.properties || {}) ||
    'numberProps' in (schema.properties || {}) ||
    'booleanProps' in (schema.properties || {}) ||
    'arrayProps' in (schema.properties || {})
  );
}

// Auto-convert if legacy format is used
if (data.schema && !isTypedSchema(data.schema)) {
  console.warn('Using legacy flat property format. Consider migrating to typed format.');
  data.schema = convertLegacyToTyped(data.schema);
}
```

### Phase 5: Testing & Documentation

**Priority**: HIGH  
**Effort**: 3-4 days  
**Risk**: LOW

1. **Update all tests**:
   - Unit tests for transformers
   - Unit tests for blueprint resource
   - Integration tests with real API
   - Smoke tests

2. **Update all examples**:
   - Create blueprint examples
   - Entity examples (minimal changes)
   - Action automation examples
   - Scorecard examples

3. **Update documentation**:
   - README with new examples
   - API documentation
   - Migration guide from v0.1.x to v0.2.0
   - Comparison guide with Pulumi

## Risk Assessment

### High Risk Items

1. **Breaking Changes**: Blueprint property structure is fundamentally different
   - **Mitigation**: Provide clear migration guide and backward compatibility layer
   - **Timeline**: Consider making this v2.0.0

2. **API Compatibility**: Need to ensure transformed data works with Port API
   - **Mitigation**: Extensive integration testing with real API
   - **Timeline**: Test in staging environment first

3. **Existing Users**: Users on v0.1.0 will need to update
   - **Mitigation**: Deprecation warnings, migration tools, comprehensive docs
   - **Timeline**: Give 6-month deprecation window

### Medium Risk Items

1. **Transformer Bugs**: Edge cases in type conversion
   - **Mitigation**: Comprehensive unit tests for all type combinations
   
2. **Performance**: Additional transformation layer
   - **Mitigation**: Benchmark and optimize hot paths

### Low Risk Items

1. **Documentation**: Keeping docs in sync
   - **Mitigation**: Automated doc generation where possible

## Timeline

### Recommended Approach: Major Version Bump

**Version 2.0.0 Release**

| Week | Phase | Tasks | Status |
|------|-------|-------|--------|
| 1 | Planning | • Finalize types<br>• Review with stakeholders<br>• Create RFC | Not Started |
| 2 | Implementation | • Update type definitions<br>• Create transformers<br>• Unit tests | Not Started |
| 3 | Implementation | • Update resources<br>• Integration tests<br>• Backward compat | Not Started |
| 4 | Testing | • Full test suite<br>• Smoke tests<br>• Performance tests | Not Started |
| 5 | Documentation | • Update all docs<br>• Migration guide<br>• Examples | Not Started |
| 6 | Release | • Beta release<br>• Gather feedback<br>• Bug fixes | Not Started |
| 7 | Release | • RC release<br>• Final testing<br>• Prepare announcement | Not Started |
| 8 | Release | • v2.0.0 GA<br>• Announce<br>• Support | Not Started |

## Success Metrics

1. **Developer Experience**:
   - [ ] Blueprints can be copy-pasted from Pulumi to SDK with minimal changes
   - [ ] IntelliSense provides helpful suggestions for property types
   - [ ] TypeScript catches type errors at compile time

2. **API Compatibility**:
   - [ ] All existing API operations work without changes
   - [ ] Transformation is lossless (round-trip conversion)
   - [ ] Performance impact < 5%

3. **Adoption**:
   - [ ] Migration guide is clear and complete
   - [ ] Example code covers common patterns
   - [ ] Users can upgrade within 1 hour

## Decision Points

### ✅ Recommended: Go Forward with v2.0.0

**Reasons**:
1. **Consistency**: Match Pulumi provider (IaC) and SDK (programmatic) patterns
2. **Developer Experience**: Much clearer what type each property is
3. **Type Safety**: Better IntelliSense and compile-time checking
4. **Future-Proof**: Easier to extend with new property types
5. **Beskar Success**: Pattern proven successful in beskar-protocol

**Concerns Addressed**:
- Breaking change → Clear migration path
- Complexity → Transformation layer handles API differences
- User impact → Backward compat layer during transition

### ❌ Alternative: Keep Current Structure

Would only make sense if:
- Port API is changing to match our current structure (unlikely)
- Pulumi provider is changing to flat structure (unlikely)
- Breaking changes are absolutely unacceptable (manage with major version)

## Next Steps

1. **Review & Approve**: Team reviews this plan and approves direction
2. **Create RFC**: Formal RFC for v2.0.0 with breaking changes
3. **Prototype**: Build small prototype to validate approach
4. **Implement**: Follow phased implementation plan
5. **Beta Test**: Get feedback from early adopters
6. **Release**: Ship v2.0.0 with full documentation

## References

- [Port Pulumi Provider](https://github.com/port-labs/pulumi-port)
- [Beskar Protocol Implementation](https://github.com/port-labs/beskar-protocol)
- [Port API Documentation](https://docs.port.io/api-reference)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-06  
**Status**: DRAFT - Awaiting Review

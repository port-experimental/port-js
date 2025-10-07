# Pulumi Provider vs. SDK: Side-by-Side Comparison

This document shows real examples from the beskar-protocol (using Pulumi) and how they would translate to the SDK after restructuring.

## Table of Contents

- [Blueprints](#blueprints)
- [Entities](#entities)
- [Actions](#actions)
- [Scorecards](#scorecards)
- [Key Benefits](#key-benefits)

---

## Blueprints

### Example: Service Blueprint

#### Pulumi (beskar-protocol/src/blueprints/security/service.ts)

```typescript
import * as port from "@port-experimental/port";

export const serviceBlueprint = new port.Blueprint("service", {
  identifier: "service",
  title: "Service",
  icon: "Service",
  properties: {
    stringProps: {
      name: {
        title: "Service Name",
        description: "Name of the service or application"
      },
      environment: {
        title: "Environment",
        enums: ["production", "staging", "development"]
      },
      dataClassification: {
        title: "Data Classification",
        enums: ["public", "internal", "confidential"]
      }
    },
    numberProps: {
      vulnerabilityCount: {
        title: "Vulnerability Count"
      },
      securityScore: {
        title: "Security Score"
      }
    },
    booleanProps: {
      hasSecurityScanning: {
        title: "Has Security Scanning"
      },
      isPubliclyAccessible: {
        title: "Is Publicly Accessible"
      }
    },
    arrayProps: {
      tags: {
        title: "Tags"
      },
      technologies: {
        title: "Technologies"
      }
    }
  },
  relations: {
    vulnerabilities: {
      title: "Vulnerabilities",
      target: "vulnerability",
      many: true
    },
    owner: {
      title: "Service Owner",
      target: "_user",
      many: false
    }
  }
});
```

#### SDK v0.1.0 (Current - DIFFERENT STRUCTURE)

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({ credentials: { /* ... */ } });

const serviceBlueprint = await client.blueprints.create({
  identifier: "service",
  title: "Service",
  icon: "Service",
  schema: {
    properties: {
      // ❌ Flat structure - have to specify 'type' for each
      name: {
        type: 'string',  // Have to remember this
        title: "Service Name",
        description: "Name of the service or application"
      },
      environment: {
        type: 'string',  // Have to remember this
        title: "Environment",
        enum: ["production", "staging", "development"]
      },
      vulnerabilityCount: {
        type: 'number',  // Have to remember this
        title: "Vulnerability Count"
      },
      hasSecurityScanning: {
        type: 'boolean',  // Have to remember this
        title: "Has Security Scanning"
      },
      tags: {
        type: 'array',  // Have to remember this
        title: "Tags"
      }
    }
  },
  relations: {
    vulnerabilities: {
      title: "Vulnerabilities",
      target: "vulnerability",
      many: true
    },
    owner: {
      title: "Service Owner",
      target: "_user",
      many: false
    }
  }
});
```

#### SDK v2.0.0 (Proposed - MATCHES PULUMI)

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({ credentials: { /* ... */ } });

const serviceBlueprint = await client.blueprints.create({
  identifier: "service",
  title: "Service",
  icon: "Service",
  properties: {
    // ✅ Grouped by type - no need to specify 'type' for each
    stringProps: {
      name: {
        title: "Service Name",
        description: "Name of the service or application"
      },
      environment: {
        title: "Environment",
        enums: ["production", "staging", "development"]
      },
      dataClassification: {
        title: "Data Classification",
        enums: ["public", "internal", "confidential"]
      }
    },
    numberProps: {
      vulnerabilityCount: {
        title: "Vulnerability Count"
      },
      securityScore: {
        title: "Security Score"
      }
    },
    booleanProps: {
      hasSecurityScanning: {
        title: "Has Security Scanning"
      },
      isPubliclyAccessible: {
        title: "Is Publicly Accessible"
      }
    },
    arrayProps: {
      tags: {
        title: "Tags"
      },
      technologies: {
        title: "Technologies"
      }
    }
  },
  relations: {
    vulnerabilities: {
      title: "Vulnerabilities",
      target: "vulnerability",
      many: true
    },
    owner: {
      title: "Service Owner",
      target: "_user",
      many: false
    }
  }
});
```

**Result**: ✅ **Perfect match!** Can copy-paste from Pulumi to SDK with minimal changes.

---

## Entities

### Example: Service Entity

#### Pulumi (beskar-protocol/src/entities/security/services.ts)

```typescript
import * as port from "@port-experimental/port";

export const customerPortal = new port.Entity("customer-portal-prod", {
  blueprint: "service",
  identifier: "customer_portal_prod",
  title: "Customer Portal (Production)",
  properties: {
    stringProps: {
      name: "Customer Portal",
      environment: "production",
      dataClassification: "confidential"
    },
    numberProps: {
      vulnerabilityCount: 3,
      securityScore: 88
    },
    booleanProps: {
      hasSecurityScanning: true,
      isPubliclyAccessible: true
    },
    arrayProps: {
      stringItems: {
        tags: ["customer-facing", "critical"],
        technologies: ["React", "Node.js", "PostgreSQL"]
      }
    }
  },
  relations: {
    singleRelations: {
      owner: "alice@company.com",
      team: "frontend_team"
    },
    manyRelations: {
      vulnerabilities: ["vuln-002", "vuln-006"],
      controls: ["access-control-001"]
    }
  }
});
```

#### SDK v0.1.0 (Current)

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({ credentials: { /* ... */ } });

const customerPortal = await client.entities.create({
  blueprint: "service",
  identifier: "customer_portal_prod",
  title: "Customer Portal (Production)",
  properties: {
    stringProps: {
      name: "Customer Portal",
      environment: "production",
      dataClassification: "confidential"
    },
    numberProps: {
      vulnerabilityCount: 3,
      securityScore: 88
    },
    booleanProps: {
      hasSecurityScanning: true,
      isPubliclyAccessible: true
    },
    arrayProps: {
      tags: ["customer-facing", "critical"],
      technologies: ["React", "Node.js", "PostgreSQL"]
    }
  },
  relations: {
    singleRelations: {
      owner: "alice@company.com",
      team: "frontend_team"
    },
    manyRelations: {
      vulnerabilities: ["vuln-002", "vuln-006"],
      controls: ["access-control-001"]
    }
  }
});
```

**Result**: ✅ **Already matches!** Entities are already using the correct structure.

**Minor difference**: Pulumi uses `arrayProps.stringItems`, SDK uses flat `arrayProps`. This is acceptable or could be aligned.

---

## Actions

### Example: Auto-Assign Vulnerability Action

#### Pulumi (beskar-protocol/src/actions/security/vulnerability-management-actions.ts)

```typescript
import * as port from "@port-experimental/port";

export const autoAssignVulnerability = new port.Action("auto-assign-vulnerability", {
  identifier: "auto_assign_vulnerability",
  title: "Auto-Assign Vulnerability to Service Owner",
  
  automationTrigger: {
    entityCreatedEvent: {
      blueprintIdentifier: "vulnerability"
    },
    jqCondition: {
      expressions: [
        '.entity.relations.services | length > 0',
        '.entity.relations.assignedTo == null'
      ],
      combinator: "and"
    }
  },
  
  upsertEntityMethod: {
    blueprintIdentifier: "vulnerability",
    mapping: {
      identifier: "{{.entity.identifier}}",
      relations: {
        assignedTo: "{{ .entity.relations.services[0] | .owner }}",
        team: "{{ .entity.relations.services[0] | .team }}"
      }
    }
  }
});
```

#### SDK v0.1.0 (Current - LIMITED)

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({ credentials: { /* ... */ } });

// ❌ Current SDK doesn't support automation triggers well
const autoAssignVulnerability = await client.actions.create({
  identifier: "auto_assign_vulnerability",
  title: "Auto-Assign Vulnerability to Service Owner",
  blueprint: "vulnerability",
  trigger: {
    type: "AUTOMATION",  // Basic support only
    operation: "CREATE"
  }
  // ❌ Can't specify:
  // - jqCondition with complex expressions
  // - upsertEntityMethod for updating entities
  // - Template mapping with entity context
});
```

#### SDK v2.0.0 (Proposed - MATCHES PULUMI)

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({ credentials: { /* ... */ } });

const autoAssignVulnerability = await client.actions.create({
  identifier: "auto_assign_vulnerability",
  title: "Auto-Assign Vulnerability to Service Owner",
  description: "Automatically assigns vulnerabilities to service owners",
  
  automationTrigger: {
    entityCreatedEvent: {
      blueprintIdentifier: "vulnerability"
    },
    jqCondition: {
      expressions: [
        '.entity.relations.services | length > 0',
        '.entity.relations.assignedTo == null'
      ],
      combinator: "and"
    }
  },
  
  upsertEntityMethod: {
    blueprintIdentifier: "vulnerability",
    mapping: {
      identifier: "{{.entity.identifier}}",
      relations: {
        assignedTo: "{{ .entity.relations.services[0] | .owner }}",
        team: "{{ .entity.relations.services[0] | .team }}"
      }
    }
  }
});
```

**Result**: ✅ **Perfect match!** Full automation action support.

---

## Scorecards

### Example: Security Program Maturity Scorecard

#### Pulumi (beskar-protocol/src/scorecards/security/security-program-maturity.ts)

```typescript
import * as port from "@port-experimental/port";

export const securityMaturityScorecard = new port.Scorecard("security-program-maturity", {
  identifier: "sec_prog_maturity",
  title: "Security Program Maturity Assessment",
  blueprint: "control",
  rules: [
    {
      identifier: "highImplRate_Gold",
      title: "High Implementation Rate",
      level: "Gold",
      description: "High percentage of controls are implemented",
      query: {
        combinator: "and",
        conditions: [
          {
            property: "status",
            operator: "=",
            value: "implemented"
          },
          {
            property: "lastTested",
            operator: "isNotEmpty"
          }
        ]
      }
    },
    {
      identifier: "activeVulnMgmt_Gold",
      title: "Active Vulnerability Management",
      level: "Gold",
      query: {
        combinator: "and",
        conditions: [
          {
            property: "category",
            operator: "contains",
            value: "vulnerability-management"
          }
        ]
      }
    }
  ]
});
```

#### SDK v0.1.0 (Current - DIFFERENT)

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({ credentials: { /* ... */ } });

const securityMaturityScorecard = await client.scorecards.create({
  identifier: "sec_prog_maturity",
  title: "Security Program Maturity Assessment",
  blueprint: "control",
  rules: [
    // ❌ Can only do single condition per rule
    {
      identifier: "highImplRate_Gold",
      title: "High Implementation Rate",
      level: "Gold",
      query: {
        property: "status",
        operator: "=",
        value: "implemented"
      }
      // ❌ Can't add multiple conditions with combinator
    }
  ]
});
```

#### SDK v2.0.0 (Proposed - MATCHES PULUMI)

```typescript
import { PortClient } from '@port-experimental/port-sdk';

const client = new PortClient({ credentials: { /* ... */ } });

const securityMaturityScorecard = await client.scorecards.create({
  identifier: "sec_prog_maturity",
  title: "Security Program Maturity Assessment",
  blueprint: "control",
  rules: [
    {
      identifier: "highImplRate_Gold",
      title: "High Implementation Rate",
      level: "Gold",
      description: "High percentage of controls are implemented",
      query: {
        combinator: "and",
        conditions: [
          {
            property: "status",
            operator: "=",
            value: "implemented"
          },
          {
            property: "lastTested",
            operator: "isNotEmpty"
          }
        ]
      }
    },
    {
      identifier: "activeVulnMgmt_Gold",
      title: "Active Vulnerability Management",
      level: "Gold",
      query: {
        combinator: "and",
        conditions: [
          {
            property: "category",
            operator: "contains",
            value: "vulnerability-management"
          }
        ]
      }
    }
  ]
});
```

**Result**: ✅ **Perfect match!** Complex scorecard queries supported.

---

## Key Benefits

### 1. **Copy-Paste Between Pulumi and SDK**

With the restructure, you can:

```typescript
// From Pulumi IaC
const blueprint = new port.Blueprint("service", {
  properties: { stringProps: { name: { title: "Name" } } }
});

// To SDK (just change the API)
const blueprint = await client.blueprints.create({
  properties: { stringProps: { name: { title: "Name" } } }
});
```

**90% of the code is identical!**

### 2. **Better Type Safety**

```typescript
// ❌ Current: Easy to make mistakes
properties: {
  name: { type: 'strign', title: 'Name' }  // Typo not caught!
}

// ✅ Proposed: Type errors caught at compile time
properties: {
  stringProps: {
    name: { title: 'Name' }  // Type is implicit, can't typo
  }
}
```

### 3. **Better IntelliSense**

When you type `properties.`, IntelliSense shows:
- `stringProps`
- `numberProps`
- `booleanProps`
- `arrayProps`

You immediately know what types are available.

### 4. **Consistency Across Resources**

| Resource | Current | Proposed |
|----------|---------|----------|
| **Blueprints** | ❌ Flat properties | ✅ Typed groups |
| **Entities** | ✅ Typed groups | ✅ Typed groups |
| **Actions** | ❌ Limited automation | ✅ Full automation |
| **Scorecards** | ❌ Single conditions | ✅ Complex queries |

### 5. **Matches Production Patterns**

The beskar-protocol project successfully manages:
- **94 blueprints** (gamification + security tracks)
- **200+ entities** (users, teams, services, vulnerabilities, controls, incidents)
- **50+ scorecards** (complex rules with multiple conditions)
- **20+ actions** (automation triggers with JQ conditions)

**All using the Pulumi pattern!**

This proves the pattern works at scale in production.

---

## Conclusion

### Current Pain Points

1. ❌ Blueprint properties use different structure than entities
2. ❌ Can't copy-paste from Pulumi to SDK
3. ❌ Have to remember to set `type` for each property
4. ❌ Limited action automation support
5. ❌ Single-condition scorecard rules

### After Restructure

1. ✅ Consistent structure across all resources
2. ✅ 90% copy-paste compatibility with Pulumi
3. ✅ Type is implicit from property group
4. ✅ Full automation action support
5. ✅ Complex scorecard queries with combinators

### Recommendation

**✅ Proceed with restructure as v2.0.0**

The benefits significantly outweigh the migration effort:
- Better developer experience
- Consistency with Pulumi
- Proven pattern in production
- Future-proof for new features

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-06  
**References**:
- [Port Pulumi Provider](https://github.com/port-experimental/pulumi-port)
- [Beskar Protocol](https://github.com/port-experimental/beskar-protocol)
- [Port SDK](https://github.com/port-experimental/port-js)

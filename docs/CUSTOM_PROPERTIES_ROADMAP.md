# Custom Properties Support Roadmap

**Last Updated**: October 4, 2025

---

## Current Implementation Status

### ✅ Fully Supported (4 Resources)

| Resource | Custom Properties | Status | Notes |
|----------|-------------------|--------|-------|
| **Blueprint** | ✅ YES | ✅ Complete | Flexible `schema.properties` - any custom fields |
| **Entity** | ✅ YES | ✅ Complete | Flexible `properties` based on blueprint schema |
| **Scorecard** | ✅ YES | ✅ Complete | Custom `rules` with flexible queries |
| **Action** | ✅ YES | ✅ Complete | Custom `userInputs` properties |

### ⚠️ Port API Limitation (2 Resources)

| Resource | Custom Properties | Status | Port API Support |
|----------|-------------------|--------|------------------|
| **Team** | ❌ NO | 🔴 **API Limitation** | Fixed schema: `name`, `description`, `users` only |
| **User** | ❌ NO | 🔴 **API Limitation** | Fixed schema: `email`, `firstName`, `lastName`, etc. |

---

## 🔴 Issue: Port API Does Not Support Custom Properties for Teams/Users

The Port.io API currently has **fixed schemas** for Teams and Users:

### Team Schema (Fixed)
```json
{
  "name": "string",       // Required
  "description": "string", // Optional
  "users": ["string"]     // Optional array of emails
}
```

### User Schema (Fixed)
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "picture": "string",
  "status": "string",
  "roles": ["string"],
  "teams": ["string"]
}
```

**These schemas cannot be extended with custom properties via the API.**

---

## 🎯 Workaround Solution

Since Port API doesn't support custom properties for Teams/Users directly, you can **use Entities to track team/user metadata**:

### Option 1: Create Team Metadata Entities

```typescript
// Step 1: Create a blueprint for team metadata
await client.blueprints.create({
  identifier: 'team_metadata',
  title: 'Team Metadata',
  schema: {
    properties: {
      team_name: {
        type: 'string',
        title: 'Team Name'
      },
      
      // ✅ Add ANY custom properties you need
      budget_code: {
        type: 'string',
        title: 'Budget Code'
      },
      
      cost_center: {
        type: 'string',
        title: 'Cost Center'
      },
      
      manager_email: {
        type: 'email',
        title: 'Manager Email'
      },
      
      headcount: {
        type: 'number',
        title: 'Team Size'
      },
      
      custom_field_1: {
        type: 'string',
        title: 'Custom Field 1'
      },
      
      any_other_field: {
        type: 'object',
        title: 'Additional Metadata'
      }
    },
    required: ['team_name']
  },
  relations: {
    team: {
      target: '_team',  // Link to Port's built-in team
      required: false,
      many: false
    }
  }
});

// Step 2: Create team in Port
const team = await client.teams.create({
  name: 'platform-team',
  description: 'Platform Engineering Team',
  users: ['alice@company.com', 'bob@company.com']
});

// Step 3: Create metadata entity with custom properties
await client.entities.create({
  identifier: 'platform-team-metadata',
  blueprint: 'team_metadata',
  title: 'Platform Team Metadata',
  properties: {
    stringProps: {
      team_name: 'platform-team',
      budget_code: 'ENG-001',
      cost_center: 'CC-1234',
      manager_email: 'manager@company.com',
      custom_field_1: 'any value you want'
    },
    numberProps: {
      headcount: 15
    },
    objectProps: {
      any_other_field: {
        custom_key: 'custom_value',
        nested_data: { foo: 'bar' }
      }
    }
  },
  relations: {
    singleRelations: {
      team: 'platform-team'  // Link to the actual team
    }
  }
});
```

### Option 2: Create User Metadata Entities

```typescript
// Step 1: Create blueprint for user metadata
await client.blueprints.create({
  identifier: 'user_metadata',
  title: 'User Metadata',
  schema: {
    properties: {
      user_email: {
        type: 'email',
        title: 'User Email'
      },
      
      // ✅ Add ANY custom properties
      employee_id: {
        type: 'string',
        title: 'Employee ID'
      },
      
      department: {
        type: 'string',
        title: 'Department',
        enum: ['Engineering', 'Product', 'Sales', 'Marketing']
      },
      
      location: {
        type: 'string',
        title: 'Office Location'
      },
      
      start_date: {
        type: 'string',
        title: 'Start Date',
        format: 'date'
      },
      
      skills: {
        type: 'array',
        title: 'Skills'
      },
      
      custom_attributes: {
        type: 'object',
        title: 'Custom Attributes'
      }
    },
    required: ['user_email']
  },
  relations: {
    user: {
      target: '_user',  // Link to Port's built-in user
      required: false,
      many: false
    }
  }
});

// Step 2: Create metadata entity with custom properties
await client.entities.create({
  identifier: 'alice-metadata',
  blueprint: 'user_metadata',
  title: 'Alice Smith Metadata',
  properties: {
    stringProps: {
      user_email: 'alice@company.com',
      employee_id: 'EMP-12345',
      department: 'Engineering',
      location: 'San Francisco',
      start_date: '2023-01-15'
    },
    arrayProps: {
      skills: ['TypeScript', 'Python', 'Kubernetes', 'AWS']
    },
    objectProps: {
      custom_attributes: {
        preferred_name: 'Ali',
        timezone: 'PST',
        oncall_rotation: 'rotation-a'
      }
    }
  },
  relations: {
    singleRelations: {
      user: 'alice@company.com'  // Link to the actual user
    }
  }
});
```

### Option 3: Extend Service/Application Entities

Instead of extending teams/users, extend your service entities with team/ownership metadata:

```typescript
await client.blueprints.create({
  identifier: 'service',
  schema: {
    properties: {
      name: { type: 'string' },
      
      // ✅ Add team-related custom properties
      team_custom_field_1: { type: 'string' },
      team_custom_field_2: { type: 'number' },
      ownership_metadata: { type: 'object' }
    }
  },
  relations: {
    team: {
      target: '_team',
      many: false
    },
    owner: {
      target: '_user',
      many: false
    }
  }
});

await client.entities.create({
  blueprint: 'service',
  identifier: 'my-service',
  properties: {
    stringProps: {
      name: 'My Service',
      team_custom_field_1: 'custom value'
    },
    numberProps: {
      team_custom_field_2: 42
    },
    objectProps: {
      ownership_metadata: {
        budget_code: 'ENG-001',
        cost_center: 'CC-1234',
        any_custom_data: 'here'
      }
    }
  },
  relations: {
    singleRelations: {
      team: 'platform-team',
      owner: 'alice@company.com'
    }
  }
});
```

---

## 📊 Feature Request Tracking

### Request to Port.io

If you need native custom properties support for Teams/Users, this must be requested from Port.io:

**Feature Request**:
- **Title**: Support custom properties for Teams and Users
- **Description**: Allow extending Team and User schemas with custom fields
- **Use Cases**:
  - Track team budget codes
  - Store user employee IDs
  - Add department/location metadata
  - Store custom organizational attributes

**Where to Request**:
- Port.io Support Portal
- Port.io Community Forum
- Port.io Product Team

### SDK Implementation Status

| Action | Status | Notes |
|--------|--------|-------|
| Document limitation | ✅ Done | This document |
| Provide workaround | ✅ Done | Entity-based metadata pattern |
| Implement in SDK | 🔴 **Blocked by API** | Waiting for Port API support |
| Add to SDK when available | ⏳ Planned | Will implement when API adds support |

---

## 🔄 Migration Path (When API Adds Support)

If/when Port adds custom properties support for Teams/Users, the SDK will:

1. **Update Type Definitions**:
```typescript
// Future: When API supports it
export interface CreateTeamInput {
  name: string;
  description?: string;
  users?: string[];
  properties?: Record<string, unknown>;  // ✅ Custom properties
}
```

2. **Update Resource Methods**:
```typescript
// Future implementation
async create(data: CreateTeamInput) {
  const response = await this.httpClient.post('/v1/teams', {
    name: data.name,
    description: data.description,
    users: data.users,
    properties: data.properties  // ✅ Pass custom properties
  });
  return this.transformTeam(response.team);
}
```

3. **Maintain Backward Compatibility**:
- Existing code will continue to work
- `properties` field will be optional
- No breaking changes

---

## ✅ What Works Today

### Blueprints & Entities (Full Flexibility)

```typescript
// ✅ Works perfectly - unlimited custom properties
const blueprint = await client.blueprints.create({
  identifier: 'anything',
  schema: {
    properties: {
      field1: { type: 'string' },
      field2: { type: 'number' },
      field3: { type: 'boolean' },
      field4: { type: 'object' },
      field5: { type: 'array' },
      // Add as many as you need!
      customField100: { type: 'string' }
    }
  }
});

const entity = await client.entities.create({
  blueprint: 'anything',
  properties: {
    stringProps: { 
      field1: 'value',
      customField100: 'another value'
    },
    numberProps: { field2: 42 },
    booleanProps: { field3: true },
    objectProps: { field4: { nested: 'data' } },
    arrayProps: { field5: [1, 2, 3] }
  }
});
```

### Teams & Users (Fixed Schema + Workaround)

```typescript
// ✅ Create team (fixed schema)
const team = await client.teams.create({
  name: 'my-team',
  description: 'My Team',
  users: ['user@example.com']
});

// ✅ Workaround: Store custom properties in metadata entity
await client.entities.create({
  blueprint: 'team_metadata',
  identifier: 'my-team-metadata',
  properties: {
    stringProps: {
      team_name: 'my-team',
      custom_field: 'any value you want'
    }
  },
  relations: {
    singleRelations: {
      team: 'my-team'
    }
  }
});
```

---

## 📝 Summary

**Current State**:
- ✅ **Blueprints & Entities**: Full custom properties support
- ❌ **Teams & Users**: Port API limitation (fixed schema)
- ✅ **Workaround**: Use metadata entities

**Action Items**:
1. ✅ Use entity-based metadata pattern for teams/users
2. ⏳ Request feature from Port.io team
3. ⏳ SDK will add support when API enables it

**SDK Status**: **Implementation is correct and complete** based on current API capabilities.


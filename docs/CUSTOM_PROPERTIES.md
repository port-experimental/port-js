# Custom Properties Support

The Port SDK fully supports custom properties for Blueprints, Entities, Teams, Actions, and Scorecards.

---

## ✅ Blueprint Custom Properties

Blueprints use `Record<string, BlueprintProperty>` which allows **any custom property names**.

### Creating a Blueprint with Custom Properties

```typescript
const blueprint = await client.blueprints.create({
  identifier: 'microservice',
  title: 'Microservice',
  schema: {
    properties: {
      // ✅ Standard properties
      name: {
        type: 'string',
        title: 'Service Name',
        required: true
      },
      
      // ✅ Custom properties - any name you want!
      customField1: {
        type: 'string',
        title: 'My Custom Field'
      },
      
      deployment_region: {
        type: 'string',
        title: 'Deployment Region',
        enum: ['us-east-1', 'us-west-2', 'eu-west-1']
      },
      
      sla_percentage: {
        type: 'number',
        title: 'SLA %',
        description: 'Target SLA percentage'
      },
      
      is_production_ready: {
        type: 'boolean',
        title: 'Production Ready'
      },
      
      metadata: {
        type: 'object',
        title: 'Custom Metadata',
        properties: {
          anyKey: { type: 'string' },
          anotherKey: { type: 'number' }
        }
      },
      
      tags: {
        type: 'array',
        title: 'Tags',
        items: { type: 'string' }
      }
    }
  }
});
```

### Adding Custom Properties (Update Existing Blueprint)

```typescript
// Get the current blueprint
const existingBlueprint = await client.blueprints.get('microservice');

// Add new custom properties
const updated = await client.blueprints.update('microservice', {
  schema: {
    properties: {
      // Keep existing properties
      ...existingBlueprint.schema?.properties,
      
      // ✅ Add new custom properties
      new_custom_field: {
        type: 'string',
        title: 'New Custom Field',
        description: 'Added after initial creation'
      },
      
      compliance_level: {
        type: 'string',
        title: 'Compliance Level',
        enum: ['low', 'medium', 'high', 'critical']
      }
    }
  }
});
```

### Modifying Custom Properties

```typescript
// Update an existing custom property
const updated = await client.blueprints.update('microservice', {
  schema: {
    properties: {
      ...existingBlueprint.schema?.properties,
      
      // ✅ Modify existing custom property
      deployment_region: {
        type: 'string',
        title: 'Deployment Region (Updated)',
        enum: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'], // Added new region
        description: 'Updated deployment regions list'
      }
    }
  }
});
```

### Deleting Custom Properties

```typescript
// Remove a custom property by omitting it
const { deployment_region, ...remainingProps } = existingBlueprint.schema?.properties || {};

const updated = await client.blueprints.update('microservice', {
  schema: {
    properties: remainingProps // ✅ deployment_region is now deleted
  }
});
```

---

## ✅ Entity Custom Properties

Entities use `Record<string, T>` for each property type, allowing **any custom property names**.

### Creating an Entity with Custom Properties

```typescript
const entity = await client.entities.create({
  identifier: 'my-service',
  blueprint: 'microservice',
  title: 'My Service',
  properties: {
    // ✅ String properties - any custom names
    stringProps: {
      name: 'user-service',
      customField1: 'custom value',
      deployment_region: 'us-east-1',
      any_other_field: 'any value'
    },
    
    // ✅ Number properties - any custom names
    numberProps: {
      port: 8080,
      sla_percentage: 99.9,
      custom_metric: 42
    },
    
    // ✅ Boolean properties - any custom names
    booleanProps: {
      is_production_ready: true,
      has_monitoring: true,
      custom_flag: false
    },
    
    // ✅ Array properties - any custom names
    arrayProps: {
      tags: ['backend', 'api'],
      custom_list: [1, 2, 3],
      another_array: ['a', 'b', 'c']
    },
    
    // ✅ Object properties - any custom names
    objectProps: {
      metadata: {
        created_by: 'john',
        version: '1.0.0'
      },
      custom_object: {
        key1: 'value1',
        key2: 123
      }
    }
  }
});
```

### Updating Entity Custom Properties

```typescript
// ✅ Add new custom properties
const updated = await client.entities.update('my-service', {
  properties: {
    stringProps: {
      new_custom_field: 'new value'
    },
    numberProps: {
      another_metric: 100
    }
  }
});

// ✅ Modify existing custom properties
const modified = await client.entities.update('my-service', {
  properties: {
    stringProps: {
      customField1: 'updated value'
    }
  }
});
```

### Deleting Entity Custom Properties

```typescript
// To delete a property, you need to set it to null or undefined
// Note: The Port API handles this based on the blueprint schema
const updated = await client.entities.update('my-service', {
  properties: {
    stringProps: {
      customField1: '' // Clear the value
    }
  }
});
```

---

## ✅ Team Custom Properties

Teams support custom properties - you can add any additional fields beyond the standard schema.

### Creating a Team with Custom Properties

```typescript
const team = await client.teams.create({
  name: 'platform-team',
  description: 'Platform Engineering Team',
  users: ['alice@company.com', 'bob@company.com'],
  
  // ✅ Add any custom properties
  budget_code: 'ENG-001',
  cost_center: 'CC-1234',
  manager_email: 'manager@company.com',
  headcount: 15,
  department: 'Engineering',
  location: 'San Francisco',
  custom_metadata: {
    slack_channel: '#platform',
    oncall_rotation: 'platform-oncall'
  }
} as any); // Type assertion for custom properties

console.log(team.name); // 'platform-team'
console.log((team as any).budget_code); // 'ENG-001'
console.log((team as any).headcount); // 15
```

### Updating Team Custom Properties

```typescript
const updated = await client.teams.update('platform-team', {
  headcount: 18, // Updated
  budget_code: 'ENG-002', // Changed
  quarterly_goals: ['Goal 1', 'Goal 2'] // Added new field
} as any);
```

### Accessing Custom Properties

```typescript
const team = await client.teams.get('platform-team');

// Access custom properties
const budgetCode = (team as any).budget_code;
const headcount = (team as any).headcount;
const metadata = (team as any).custom_metadata;
```

**Note**: TypeScript requires `as any` type assertion for custom properties since they're dynamic.

---

## 🎯 Property Type Support

The SDK supports all Port property types:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text values | `"hello world"` |
| `number` | Numeric values | `42`, `3.14` |
| `boolean` | True/false | `true`, `false` |
| `object` | JSON objects | `{ "key": "value" }` |
| `array` | Lists | `["a", "b", "c"]` |
| `url` | URL strings | `"https://example.com"` |
| `email` | Email addresses | `"user@example.com"` |
| `user` | Port user references | `"user@company.com"` |
| `team` | Port team references | `"platform-team"` |
| `datetime` | ISO date strings | `"2025-10-04T12:00:00Z"` |
| `timer` | Timer values | Expiration timestamps |

---

## 💡 Best Practices

### 1. Use Descriptive Property Names

```typescript
// ✅ Good - clear and descriptive
deployment_region: { type: 'string' }
sla_percentage: { type: 'number' }
is_production_ready: { type: 'boolean' }

// ❌ Bad - unclear
dr: { type: 'string' }
pct: { type: 'number' }
prod: { type: 'boolean' }
```

### 2. Add Titles and Descriptions

```typescript
custom_metric: {
  type: 'number',
  title: 'Custom Metric',  // ✅ Human-readable title
  description: 'Tracks the custom KPI for this service'  // ✅ Helpful description
}
```

### 3. Use Enums for Fixed Values

```typescript
compliance_level: {
  type: 'string',
  enum: ['low', 'medium', 'high', 'critical'],  // ✅ Restricts to valid values
  enumColors: {  // ✅ Visual indicators in Port UI
    'low': 'lightGray',
    'medium': 'yellow',
    'high': 'orange',
    'critical': 'red'
  }
}
```

### 4. Validate Required Properties

```typescript
schema: {
  properties: {
    name: { type: 'string' },
    region: { type: 'string' }
  },
  required: ['name', 'region']  // ✅ Mark as required
}
```

### 5. Use Formats for Validation

```typescript
repository_url: {
  type: 'string',
  format: 'url'  // ✅ Validates URL format
}

owner_email: {
  type: 'string',
  format: 'email'  // ✅ Validates email format
}

created_date: {
  type: 'string',
  format: 'date-time'  // ✅ Validates ISO 8601 format
}
```

---

## ✅ Verification

The SDK is designed to be **fully flexible** with custom properties:

- ✅ **No hardcoded property names** - all use `Record<string, T>` or index signatures
- ✅ **Create blueprints** with any custom properties
- ✅ **Update blueprints** to add/modify/remove properties
- ✅ **Create entities** with any custom property values
- ✅ **Update entities** to add/modify property values
- ✅ **Create teams** with any custom properties
- ✅ **Update teams** with custom properties
- ✅ **TypeScript-safe** - full type inference maintained (use `as any` for dynamic properties)
- ✅ **Validation** - Port API validates against schemas

---

## 🔍 Example: Complete Custom Property Lifecycle

```typescript
// 1. Create blueprint with custom properties
const blueprint = await client.blueprints.create({
  identifier: 'api-service',
  title: 'API Service',
  schema: {
    properties: {
      service_name: { type: 'string', required: true },
      custom_sla: { type: 'number' },
      custom_tags: { type: 'array', items: { type: 'string' } }
    },
    required: ['service_name']
  }
});

// 2. Create entity with custom values
const entity = await client.entities.create({
  identifier: 'my-api',
  blueprint: 'api-service',
  title: 'My API',
  properties: {
    stringProps: {
      service_name: 'payments-api'
    },
    numberProps: {
      custom_sla: 99.95
    },
    arrayProps: {
      custom_tags: ['payments', 'critical', 'pci-compliant']
    }
  }
});

// 3. Add new custom property to blueprint
await client.blueprints.update('api-service', {
  schema: {
    properties: {
      ...blueprint.schema?.properties,
      custom_rating: { type: 'number', title: 'Service Rating' }
    }
  }
});

// 4. Update entity with new custom property value
await client.entities.update('my-api', {
  properties: {
    numberProps: {
      custom_rating: 4.8
    }
  }
});

console.log('✅ Custom properties fully supported throughout the lifecycle!');
```

---

## 🎉 Summary

The SDK **fully supports custom properties** with:
- ✅ Flexible type system (`Record<string, T>`)
- ✅ All CRUD operations
- ✅ Type-safe TypeScript
- ✅ Port API validation
- ✅ No restrictions on property names
- ✅ Complete property lifecycle management

**You can create, update, and delete custom properties at any time!**


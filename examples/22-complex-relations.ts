/**
 * Example: Complex Relations Scenarios
 * 
 * Demonstrates advanced relation patterns:
 * - Service dependencies (many-to-many)
 * - Hierarchical relations (parent-child)
 * - Transitive relations
 * - Bulk relation updates
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET environment variables
 * - 'service' blueprint with dependency relations
 * 
 * Run: npx tsx examples/22-complex-relations.ts
 */

import { PortClient } from '../src';

async function main() {
  console.log('🔗 Example: Complex Relations\n');

  const client = new PortClient();

  try {
    // ============================================================
    // PART 1: Service Dependency Graph
    // ============================================================
    console.log('📝 Part 1: Building a Service Dependency Graph\n');

    // Create a microservices architecture
    const services = [
      {
        identifier: 'api-gateway',
        title: 'API Gateway',
        description: 'Entry point for all API requests',
        dependencies: [],
      },
      {
        identifier: 'auth-service',
        title: 'Auth Service',
        description: 'Authentication and authorization',
        dependencies: ['database'],
      },
      {
        identifier: 'user-service',
        title: 'User Service',
        description: 'User profile management',
        dependencies: ['database', 'auth-service'],
      },
      {
        identifier: 'order-service',
        title: 'Order Service',
        description: 'Order processing',
        dependencies: ['user-service', 'payment-service', 'inventory-service'],
      },
      {
        identifier: 'payment-service',
        title: 'Payment Service',
        description: 'Payment processing',
        dependencies: ['database', 'auth-service'],
      },
      {
        identifier: 'inventory-service',
        title: 'Inventory Service',
        description: 'Product inventory',
        dependencies: ['database'],
      },
      {
        identifier: 'database',
        title: 'PostgreSQL Database',
        description: 'Main database',
        dependencies: [],
      },
    ];

    console.log('Creating service dependency graph...');
    for (const svc of services) {
      await client.entities.create({
        identifier: svc.identifier,
        blueprint: 'service',
        title: svc.title,
        properties: {
          stringProps: {
            description: svc.description,
          },
        },
        relations: {
          manyRelations: {
            dependencies: svc.dependencies,
            dependents: [],  // Will be populated later
          },
        },
      });
      console.log(`✅ Created: ${svc.identifier} → depends on [${svc.dependencies.join(', ') || 'none'}]`);
    }

    // ============================================================
    // PART 2: Populate Reverse Relations (dependents)
    // ============================================================
    console.log('\n📝 Part 2: Populating Reverse Relations\n');

    // Build a map of dependents
    const dependentsMap: Record<string, string[]> = {};
    
    for (const svc of services) {
      for (const dep of svc.dependencies) {
        if (!dependentsMap[dep]) {
          dependentsMap[dep] = [];
        }
        dependentsMap[dep].push(svc.identifier);
      }
    }

    // Update each service with its dependents
    for (const [serviceId, dependents] of Object.entries(dependentsMap)) {
      if (dependents.length > 0) {
        await client.entities.update(serviceId, 'service', {
          relations: {
            manyRelations: {
              dependencies: services.find(s => s.identifier === serviceId)?.dependencies || [],
              dependents: dependents,
            },
          },
        });
        console.log(`✅ Updated ${serviceId} ← depended on by [${dependents.join(', ')}]`);
      }
    }

    // ============================================================
    // PART 3: Query the Dependency Graph
    // ============================================================
    console.log('\n📝 Part 3: Querying the Dependency Graph\n');

    // Find all services that depend on the database
    const dbDependents = await client.entities.search({
      combinator: 'and',
      rules: [
        {
          property: '$blueprint',
          operator: '=',
          value: 'service',
        },
        {
          property: '$identifier',
          operator: 'in',
          value: dependentsMap['database'] || [],
        },
      ],
    });
    console.log(`📊 Services depending on database: ${dbDependents.length}`);
    dbDependents.forEach(svc => console.log(`   - ${svc.identifier}`));

    // Find leaf services (no dependents)
    const allServices = await client.entities.search({
      combinator: 'and',
      rules: [
        {
          property: '$blueprint',
          operator: '=',
          value: 'service',
        },
      ],
    });
    
    const leafServices = allServices.filter(
      svc => !svc.relations?.manyRelations?.dependents?.length
    );
    console.log(`\n📊 Leaf services (no dependents): ${leafServices.length}`);
    leafServices.forEach(svc => console.log(`   - ${svc.identifier}`));

    // Find root services (no dependencies)
    const rootServices = allServices.filter(
      svc => !svc.relations?.manyRelations?.dependencies?.length
    );
    console.log(`\n📊 Root services (no dependencies): ${rootServices.length}`);
    rootServices.forEach(svc => console.log(`   - ${svc.identifier}`));

    // ============================================================
    // PART 4: Calculate Transitive Dependencies
    // ============================================================
    console.log('\n📝 Part 4: Transitive Dependencies\n');

    /**
     * Get all transitive dependencies of a service
     */
    async function getTransitiveDependencies(
      serviceId: string,
      visited: Set<string> = new Set()
    ): Promise<string[]> {
      if (visited.has(serviceId)) return [];
      visited.add(serviceId);

      const service = await client.entities.get(serviceId, 'service');
      const directDeps = service.relations?.manyRelations?.dependencies || [];
      
      let allDeps = [...directDeps];
      
      for (const dep of directDeps) {
        const transitiveDeps = await getTransitiveDependencies(dep, visited);
        allDeps = [...allDeps, ...transitiveDeps];
      }
      
      return [...new Set(allDeps)]; // Remove duplicates
    }

    // Calculate transitive dependencies for order-service
    const orderDeps = await getTransitiveDependencies('order-service');
    console.log(`📊 order-service transitive dependencies (${orderDeps.length}):`);
    orderDeps.forEach(dep => console.log(`   - ${dep}`));

    // ============================================================
    // PART 5: Bulk Relation Updates
    // ============================================================
    console.log('\n📝 Part 5: Bulk Relation Updates\n');

    // Scenario: Add a new caching layer that all services depend on
    console.log('Adding redis-cache dependency to all services...');
    
    // Create cache service
    await client.entities.create({
      identifier: 'redis-cache',
      blueprint: 'service',
      title: 'Redis Cache',
      properties: {
        stringProps: {
          description: 'Distributed caching layer',
        },
      },
      relations: {
        manyRelations: {
          dependencies: [],
          dependents: [],
        },
      },
    });

    // Update all services to depend on cache
    const servicesToUpdate = allServices.filter(
      svc => svc.identifier !== 'redis-cache' && svc.identifier !== 'database'
    );

    for (const svc of servicesToUpdate) {
      const existingDeps = svc.relations?.manyRelations?.dependencies || [];
      await client.entities.update(svc.identifier, 'service', {
        relations: {
          manyRelations: {
            dependencies: [...existingDeps, 'redis-cache'],
            dependents: svc.relations?.manyRelations?.dependents || [],
          },
        },
      });
    }
    console.log(`✅ Added redis-cache as dependency to ${servicesToUpdate.length} services`);

    // Update cache with dependents
    await client.entities.update('redis-cache', 'service', {
      relations: {
        manyRelations: {
          dependencies: [],
          dependents: servicesToUpdate.map(s => s.identifier),
        },
      },
    });
    console.log(`✅ Updated redis-cache with ${servicesToUpdate.length} dependents`);

    // ============================================================
    // PART 6: Visualize Dependency Graph
    // ============================================================
    console.log('\n📝 Part 6: Dependency Graph Visualization\n');

    /**
     * Generate a simple text-based dependency tree
     */
    function printDependencyTree(serviceId: string, deps: Record<string, string[]>, indent = '') {
      console.log(`${indent}${serviceId}`);
      const children = deps[serviceId] || [];
      children.forEach((child, idx) => {
        const isLast = idx === children.length - 1;
        const prefix = indent + (isLast ? '└── ' : '├── ');
        const childIndent = indent + (isLast ? '    ' : '│   ');
        console.log(`${prefix}${child}`);
      });
    }

    // Build dependency tree
    const depsTree: Record<string, string[]> = {};
    for (const svc of services) {
      depsTree[svc.identifier] = svc.dependencies;
    }
    depsTree['redis-cache'] = [];

    console.log('Dependency Tree for order-service:');
    console.log('order-service');
    const orderService = await client.entities.get('order-service', 'service');
    const orderDependencies = orderService.relations?.manyRelations?.dependencies || [];
    orderDependencies.forEach((dep, idx) => {
      const isLast = idx === orderDependencies.length - 1;
      console.log(`${isLast ? '└── ' : '├── '}${dep}`);
      
      const depService = services.find(s => s.identifier === dep);
      if (depService && depService.dependencies.length > 0) {
        const subIndent = isLast ? '    ' : '│   ';
        depService.dependencies.forEach((subDep, subIdx) => {
          const isSubLast = subIdx === depService.dependencies.length - 1;
          console.log(`${subIndent}${isSubLast ? '└── ' : '├── '}${subDep}`);
        });
      }
    });

    // ============================================================
    // Cleanup
    // ============================================================
    console.log('\n🗑️  Cleaning up...\n');

    const allCreatedServices = [...services.map(s => s.identifier), 'redis-cache'];
    for (const serviceId of allCreatedServices) {
      try {
        await client.entities.delete(serviceId, 'service');
        console.log(`✅ Deleted: ${serviceId}`);
      } catch (error) {
        // Ignore if already deleted
      }
    }

    // ============================================================
    // Summary
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ Example completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📚 Key Takeaways:');
    console.log('');
    console.log('1. Many-to-many relations create dependency graphs');
    console.log('2. Always maintain bidirectional relations (dependencies ↔ dependents)');
    console.log('3. Use search queries to traverse the graph');
    console.log('4. Calculate transitive dependencies for impact analysis');
    console.log('5. Bulk updates useful for adding cross-cutting dependencies');
    console.log('6. Visualize relations to understand system architecture');
    console.log('');
    console.log('💡 Use Cases:');
    console.log('- Service mesh architecture');
    console.log('- Impact analysis (what breaks if this service fails?)');
    console.log('- Deployment order planning');
    console.log('- Security risk assessment');
    console.log('- Cost allocation across services');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();


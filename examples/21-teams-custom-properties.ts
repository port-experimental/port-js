/**
 * Example: Teams with Custom Properties
 * 
 * This example demonstrates how to:
 * - Create teams with custom properties
 * - Update teams with custom properties
 * - Retrieve and use custom property values
 * 
 * Run with: pnpm tsx examples/21-teams-custom-properties.ts
 */

import { PortClient } from '../src';

async function main() {
  const client = new PortClient();

  console.log('🏷️  Teams with Custom Properties Example\n');
  console.log('━'.repeat(60));

  try {
    // ============================================================
    // Example 1: Create Team with Custom Properties
    // ============================================================
    console.log('\n📦 Example 1: Create team with custom properties');
    console.log('─'.repeat(60));
    
    const team = await client.teams.create({
      name: 'platform-engineering',
      description: 'Platform Engineering Team',
      users: ['alice@company.com', 'bob@company.com'],
      
      // ✅ Add custom properties - any fields you need!
      budget_code: 'ENG-PLATFORM-001',
      cost_center: 'CC-1234',
      manager_email: 'manager@company.com',
      headcount: 12,
      quarterly_okrs: ['Improve deployment speed', 'Reduce infrastructure costs'],
      location: 'San Francisco',
      department: 'Engineering',
      status: 'active',
      custom_metadata: {
        oncall_rotation: 'platform-oncall',
        slack_channel: '#platform-eng',
        pagerduty_service: 'platform-service'
      }
    } as any); // Type assertion for custom properties
    
    console.log(`✅ Created team: ${team.name}`);
    console.log(`   Standard fields:`);
    console.log(`     - Description: ${team.description}`);
    console.log(`     - Users: ${team.users?.length || 0}`);
    console.log(`   Custom properties:`);
    console.log(`     - Budget Code: ${(team as any).budget_code}`);
    console.log(`     - Cost Center: ${(team as any).cost_center}`);
    console.log(`     - Manager: ${(team as any).manager_email}`);
    console.log(`     - Headcount: ${(team as any).headcount}`);
    console.log(`     - Department: ${(team as any).department}`);

    // ============================================================
    // Example 2: Get Team and Access Custom Properties
    // ============================================================
    console.log('\n🔍 Example 2: Retrieve team with custom properties');
    console.log('─'.repeat(60));
    
    const retrievedTeam = await client.teams.get('platform-engineering');
    
    console.log(`✅ Retrieved team: ${retrievedTeam.name}`);
    console.log(`   Custom properties still available:`);
    console.log(`     - Budget Code: ${(retrievedTeam as any).budget_code}`);
    console.log(`     - Headcount: ${(retrievedTeam as any).headcount}`);
    console.log(`     - Location: ${(retrievedTeam as any).location}`);
    
    // Access custom metadata object
    const customMetadata = (retrievedTeam as any).custom_metadata;
    if (customMetadata) {
      console.log(`     - Slack Channel: ${customMetadata.slack_channel}`);
      console.log(`     - OnCall Rotation: ${customMetadata.oncall_rotation}`);
    }

    // ============================================================
    // Example 3: Update Team Custom Properties
    // ============================================================
    console.log('\n✏️  Example 3: Update team custom properties');
    console.log('─'.repeat(60));
    
    const updatedTeam = await client.teams.update('platform-engineering', {
      description: 'Platform Engineering Team (Updated)',
      headcount: 15, // Increased team size
      quarterly_okrs: [
        'Improve deployment speed',
        'Reduce infrastructure costs',
        'Enhance observability'  // Added new OKR
      ],
      budget_code: 'ENG-PLATFORM-002' // Updated budget code
    } as any);
    
    console.log(`✅ Updated team custom properties:`);
    console.log(`   - Headcount: 12 → ${(updatedTeam as any).headcount}`);
    console.log(`   - Budget: ENG-PLATFORM-001 → ${(updatedTeam as any).budget_code}`);
    console.log(`   - OKRs: ${(updatedTeam as any).quarterly_okrs?.length || 0} items`);

    // ============================================================
    // Example 4: List Teams and Filter by Custom Properties
    // ============================================================
    console.log('\n📋 Example 4: List teams and access custom properties');
    console.log('─'.repeat(60));
    
    const teams = await client.teams.list();
    
    console.log(`✅ Found ${teams.length} team(s)`);
    
    // Filter teams by custom property
    const engineeringTeams = teams.filter((t: any) => t.department === 'Engineering');
    console.log(`   - Engineering teams: ${engineeringTeams.length}`);
    
    // Filter by headcount
    const largeTeams = teams.filter((t: any) => t.headcount && t.headcount > 10);
    console.log(`   - Large teams (>10 people): ${largeTeams.length}`);
    
    // Display custom properties for each team
    teams.forEach((t: any) => {
      if (t.budget_code) {
        console.log(`   - ${t.name}: Budget ${t.budget_code}, ${t.headcount || 0} members`);
      }
    });

    // ============================================================
    // Example 5: Use Custom Properties for Organization
    // ============================================================
    console.log('\n🎯 Example 5: Practical use cases for custom properties');
    console.log('─'.repeat(60));
    
    console.log('✅ Common custom properties for teams:');
    console.log('   Financial:');
    console.log('     - budget_code, cost_center, budget_owner');
    console.log('   Organizational:');
    console.log('     - department, location, headcount, manager_email');
    console.log('   Communication:');
    console.log('     - slack_channel, email_alias, meeting_link');
    console.log('   Operational:');
    console.log('     - oncall_rotation, pagerduty_service, status');
    console.log('   Planning:');
    console.log('     - quarterly_okrs, roadmap_link, capacity');
    console.log('   Custom:');
    console.log('     - Any other fields your organization needs!');

    // ============================================================
    // Example 6: Complex Custom Metadata
    // ============================================================
    console.log('\n📊 Example 6: Complex custom metadata objects');
    console.log('─'.repeat(60));
    
    await client.teams.update('platform-engineering', {
      custom_metadata: {
        tools: {
          ci_cd: 'GitHub Actions',
          monitoring: 'Datadog',
          incident_management: 'PagerDuty'
        },
        metrics: {
          deployment_frequency: '10/day',
          mttr_minutes: 15,
          change_failure_rate: 0.02
        },
        certifications: ['SOC2', 'ISO27001']
      }
    } as any);
    
    console.log('✅ Updated team with complex custom metadata');
    console.log('   - Tools configuration');
    console.log('   - Team metrics');
    console.log('   - Compliance certifications');

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await client.teams.delete('platform-engineering');
    console.log('✅ Cleanup complete');

    console.log('\n━'.repeat(60));
    console.log('✅ Custom properties demonstration complete!\n');
    console.log('💡 Teams now fully support custom properties!');
    console.log('   Add any fields you need for your organization.\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();


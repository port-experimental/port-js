/**
 * Example: Team CRUD Operations
 * 
 * This example demonstrates how to:
 * - Create teams
 * - Get team information
 * - Update teams (partial)
 * - Change teams (full replacement)
 * - List all teams
 * - Delete teams
 * 
 * Run with: pnpm tsx examples/19-teams-crud.ts
 */

import { PortClient } from '../src';

async function main() {
  // Initialize the client (uses credentials from environment variables)
  const client = new PortClient();

  console.log('🏷️  Team CRUD Operations Example\n');
  console.log('━'.repeat(60));

  try {
    // ============================================================
    // Example 1: Create a new team
    // ============================================================
    console.log('\n📦 Example 1: Create a team');
    console.log('─'.repeat(60));
    
    const newTeam = await client.teams.create({
      name: 'platform-team',
      description: 'Platform Engineering Team',
      users: ['alice@company.com', 'bob@company.com']
    });
    
    console.log(`✅ Created team: ${newTeam.name}`);
    console.log(`   ID: ${newTeam.id}`);
    console.log(`   Description: ${newTeam.description}`);
    console.log(`   Provider: ${newTeam.provider}`);
    console.log(`   Created at: ${newTeam.createdAt.toISOString()}`);

    // ============================================================
    // Example 2: Get team information
    // ============================================================
    console.log('\n🔍 Example 2: Get team information');
    console.log('─'.repeat(60));
    
    const team = await client.teams.get('platform-team');
    
    console.log(`✅ Retrieved team: ${team.name}`);
    console.log(`   Description: ${team.description}`);
    console.log(`   Users: ${team.users?.length || 0}`);
    if (team.users) {
      team.users.forEach(user => {
        console.log(`     - ${user.email} (${user.firstName} ${user.lastName})`);
      });
    }

    // ============================================================
    // Example 3: Update team (partial update)
    // ============================================================
    console.log('\n✏️  Example 3: Update team (PATCH)');
    console.log('─'.repeat(60));
    
    const updatedTeam = await client.teams.update('platform-team', {
      description: 'Platform Engineering and DevOps Team',
      users: ['alice@company.com', 'bob@company.com', 'charlie@company.com']
    });
    
    console.log(`✅ Updated team: ${updatedTeam.name}`);
    console.log(`   New description: ${updatedTeam.description}`);
    console.log(`   Updated at: ${updatedTeam.updatedAt.toISOString()}`);

    // ============================================================
    // Example 4: List all teams
    // ============================================================
    console.log('\n📋 Example 4: List all teams');
    console.log('─'.repeat(60));
    
    const teams = await client.teams.list();
    
    console.log(`✅ Found ${teams.length} team(s):`);
    teams.forEach(t => {
      console.log(`   - ${t.name} (${t.description || 'No description'})`);
    });

    // ============================================================
    // Example 5: List teams with specific fields
    // ============================================================
    console.log('\n📋 Example 5: List teams with user information');
    console.log('─'.repeat(60));
    
    const teamsWithUsers = await client.teams.list({
      fields: ['name', 'description', 'users.email', 'users.firstName', 'users.lastName']
    });
    
    console.log(`✅ Found ${teamsWithUsers.length} team(s) with user details:`);
    teamsWithUsers.forEach(t => {
      console.log(`   - ${t.name}: ${t.users?.length || 0} users`);
      t.users?.forEach(user => {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        console.log(`     • ${user.email}${fullName ? ` (${fullName})` : ''}`);
      });
    });

    // ============================================================
    // Example 6: Change team (full replacement)
    // ============================================================
    console.log('\n🔄 Example 6: Change team (PUT - full replacement)');
    console.log('─'.repeat(60));
    
    const replacedTeam = await client.teams.change('platform-team', {
      description: 'Completely new description',
      users: ['newuser@company.com'] // This replaces ALL users
    });
    
    console.log(`✅ Replaced team: ${replacedTeam.name}`);
    console.log(`   New description: ${replacedTeam.description}`);
    console.log(`   ⚠️  Note: PUT replaces the entire team data`);

    // ============================================================
    // Example 7: Delete team
    // ============================================================
    console.log('\n🗑️  Example 7: Delete team');
    console.log('─'.repeat(60));
    
    await client.teams.delete('platform-team');
    
    console.log(`✅ Deleted team: platform-team`);

    // Verify deletion
    try {
      await client.teams.get('platform-team');
      console.log('❌ Team still exists (unexpected)');
    } catch (error) {
      console.log('✅ Confirmed: Team no longer exists');
    }

    // ============================================================
    // Example 8: Create team without users
    // ============================================================
    console.log('\n📦 Example 8: Create team without users');
    console.log('─'.repeat(60));
    
    const minimalTeam = await client.teams.create({
      name: 'new-team',
      description: 'A team without initial users'
    });
    
    console.log(`✅ Created minimal team: ${minimalTeam.name}`);
    console.log(`   Description: ${minimalTeam.description}`);
    console.log(`   Users: ${minimalTeam.users?.length || 0}`);

    // Clean up
    await client.teams.delete('new-team');
    console.log('✅ Cleaned up: new-team');

    console.log('\n━'.repeat(60));
    console.log('✅ All team operations completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();


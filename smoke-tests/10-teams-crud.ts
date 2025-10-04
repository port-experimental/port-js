/**
 * Smoke Test: Team CRUD Operations
 * 
 * Tests the full lifecycle of team operations against the real Port API:
 * - Create team
 * - Get team
 * - Update team
 * - List teams
 * - Delete team
 * 
 * Prerequisites:
 * - PORT_CLIENT_ID and PORT_CLIENT_SECRET in .env.local
 * 
 * Run with: pnpm smoke:teams
 */

import { PortClient } from '../src';

async function main() {
  const client = new PortClient();
  const timestamp = Date.now();
  const testTeamName = `smoke_test_team_${timestamp}`;
  
  let createdTeamName: string | undefined;

  console.log('🧪 Smoke Test: Team CRUD Operations');
  console.log('━'.repeat(60));
  console.log(`Test team: ${testTeamName}`);
  console.log('━'.repeat(60));

  try {
    // ✅ Step 1: Create Test Team
    console.log('\n📦 Step 1: Creating test team...');
    const team = await client.teams.create({
      name: testTeamName,
      description: 'Smoke test team created by SDK',
      users: []
    });
    createdTeamName = team.name;
    console.log(`✅ Created team: ${team.name}`);
    console.log(`   ID: ${team.id}`);
    console.log(`   Description: ${team.description}`);

    // ✅ Step 2: Verify Team Exists
    console.log('\n🔍 Step 2: Fetching created team...');
    const fetchedTeam = await client.teams.get(testTeamName);
    console.log(`✅ Fetched team: ${fetchedTeam.name}`);
    console.log(`   Description: ${fetchedTeam.description}`);
    
    // Verify data matches
    if (fetchedTeam.name !== team.name) {
      throw new Error(`❌ Team name mismatch! Expected: ${team.name}, Got: ${fetchedTeam.name}`);
    }
    console.log('✅ Team data verified');

    // ✅ Step 3: Update Team
    console.log('\n✏️  Step 3: Updating team...');
    const updatedTeam = await client.teams.update(testTeamName, {
      description: 'Updated smoke test team description'
    });
    console.log(`✅ Updated team: ${updatedTeam.name}`);
    console.log(`   New description: ${updatedTeam.description}`);
    
    if (updatedTeam.description !== 'Updated smoke test team description') {
      throw new Error('❌ Team description not updated!');
    }

    // ✅ Step 4: List Teams
    console.log('\n📋 Step 4: Listing teams...');
    const teams = await client.teams.list();
    console.log(`✅ Found ${teams.length} team(s)`);
    
    const testTeamFound = teams.some(t => t.name === testTeamName);
    if (!testTeamFound) {
      throw new Error('❌ Test team not found in list!');
    }
    console.log('   ✓ Test team found in list');

    // ✅ Step 5: Delete Team
    console.log('\n🗑️  Step 5: Deleting team...');
    await client.teams.delete(testTeamName);
    console.log(`✅ Deleted team: ${testTeamName}`);
    createdTeamName = undefined;

    // ✅ Step 6: Verify Deletion
    console.log('\n🔍 Step 6: Verifying deletion...');
    try {
      await client.teams.get(testTeamName);
      throw new Error('❌ Team still exists after deletion!');
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.log('✅ Team successfully deleted (404 confirmed)');
      } else {
        throw error;
      }
    }

    console.log('\n━'.repeat(60));
    console.log('✅ All operations successful!');
    console.log('   ✓ Team: Created, fetched, updated, listed, deleted');
    console.log('🎉 Smoke test passed!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    console.error('');
    process.exit(1);
  } finally {
    // 🧹 Always cleanup (in case test fails before deletion step)
    if (createdTeamName) {
      console.log('\n🧹 Cleaning up remaining resources...');
      try {
        await client.teams.delete(createdTeamName);
        console.log(`✅ Cleaned up team: ${createdTeamName}`);
      } catch (cleanupError) {
        console.error('⚠️  Failed to clean up team (may not exist):', cleanupError instanceof Error ? cleanupError.message : cleanupError);
      }
      console.log('✅ cleanup complete');
    }
  }
}

main();


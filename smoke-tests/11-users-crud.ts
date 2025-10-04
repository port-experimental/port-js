/**
 * Smoke Test: User CRUD Operations
 * 
 * Tests user invitation, get, update, list operations against real Port API
 * 
 * Required Environment Variables:
 * - PORT_CLIENT_ID
 * - PORT_CLIENT_SECRET
 * 
 * Run with: pnpm smoke:users
 */

import { PortClient } from '../src';

async function main() {
  const testEmail = `smoke-test-${Date.now()}@example.com`;
  let invitedUser: boolean = false;

  console.log('🧪 User CRUD Smoke Test\n');
  console.log('━'.repeat(60));

  const client = new PortClient();

  try {
    // ✅ Step 1: Invite a User
    console.log('\n📨 Step 1: Inviting user...');
    const user = await client.users.invite({
      email: testEmail,
      roles: ['Member'],
      teams: [],
    });
    invitedUser = true;
    console.log(`✅ Invited user: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Status: ${user.status}`);

    // ✅ Step 2: Get the User
    console.log('\n🔍 Step 2: Getting user...');
    const fetchedUser = await client.users.get(testEmail);
    console.log(`✅ Retrieved user: ${fetchedUser.email}`);
    console.log(`   ID: ${fetchedUser.id}`);
    console.log(`   Status: ${fetchedUser.status}`);

    // Verify the user data matches
    if (fetchedUser.email !== testEmail) {
      throw new Error(`Email mismatch: expected ${testEmail}, got ${fetchedUser.email}`);
    }

    // ✅ Step 3: Get User with Fields
    console.log('\n👤 Step 3: Getting user with roles and teams...');
    const userWithFields = await client.users.get(testEmail, {
      fields: ['roles', 'teams'],
    });
    console.log(`✅ Retrieved user with fields: ${userWithFields.email}`);
    if (userWithFields.roles) {
      console.log(`   Roles: ${userWithFields.roles.map(r => r.name).join(', ') || 'none'}`);
    }
    if (userWithFields.teams) {
      console.log(`   Teams: ${userWithFields.teams.map(t => t.name).join(', ') || 'none'}`);
    }

    // ✅ Step 4: Update User Roles
    console.log('\n✏️  Step 4: Updating user roles...');
    const updatedUser = await client.users.update(testEmail, {
      roles: ['Member', 'Admin'],
    });
    console.log(`✅ Updated user roles: ${updatedUser.email}`);
    console.log(`   Updated at: ${updatedUser.updatedAt.toISOString()}`);

    // ✅ Step 5: List Users
    console.log('\n📋 Step 5: Listing users...');
    const users = await client.users.list();
    console.log(`✅ Found ${users.length} users`);
    
    // Verify our test user is in the list
    const foundUser = users.find(u => u.email === testEmail);
    if (!foundUser) {
      throw new Error(`Invited user ${testEmail} not found in user list`);
    }
    console.log(`   ✓ Test user found in list`);

    // ✅ Step 6: List Users with Fields
    console.log('\n👥 Step 6: Listing users with roles and teams...');
    const usersWithFields = await client.users.list({
      fields: ['roles', 'teams'],
    });
    console.log(`✅ Found ${usersWithFields.length} users with fields`);
    const userWithDetails = usersWithFields.find(u => u.email === testEmail);
    if (userWithDetails && userWithDetails.roles) {
      console.log(`   Test user roles: ${userWithDetails.roles.map(r => r.name).join(', ')}`);
    }

    // ✅ Step 7: Delete User
    console.log('\n🗑️  Step 7: Deleting user...');
    await client.users.delete(testEmail);
    console.log(`✅ Deleted user: ${testEmail}`);
    invitedUser = false;

    // ✅ Step 8: Verify Deletion
    console.log('\n✅ Step 8: Verifying deletion...');
    try {
      await client.users.get(testEmail);
      throw new Error('User should have been deleted but still exists');
    } catch (error: any) {
      if (error.message.includes('not found') || error.statusCode === 404) {
        console.log('✅ Verified: User successfully deleted');
      } else {
        throw error;
      }
    }

    console.log('\n━'.repeat(60));
    console.log('✅ All user CRUD operations completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Smoke test failed:', error);
    throw error;
  } finally {
    // Clean up: Delete invited user if it still exists
    if (invitedUser) {
      try {
        console.log('\n🧹 Cleaning up: Deleting test user...');
        await client.users.delete(testEmail);
        console.log('✅ Cleanup complete');
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed:', cleanupError);
        console.error(`   Please manually delete user: ${testEmail}`);
      }
    }
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });


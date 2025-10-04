/**
 * Example: User Management Operations
 * 
 * This example demonstrates how to:
 * - Invite new users
 * - Get user details
 * - Update user roles and teams
 * - Delete users
 * - List all users
 * 
 * Run with: pnpm tsx examples/22-users-crud.ts
 */

import { PortClient } from '../src';

async function main() {
  const client = new PortClient();

  console.log('👥 User Management Example\n');
  console.log('━'.repeat(60));

  try {
    // ============================================================
    // Example 1: Invite a New User
    // ============================================================
    console.log('\n📨 Example 1: Invite a new user');
    console.log('─'.repeat(60));
    
    const newUser = await client.users.invite({
      email: 'newuser@company.com',
      roles: ['Member'], // Assign initial roles
      teams: ['engineering'] // Assign to teams
    });
    
    console.log(`✅ Invited user: ${newUser.email}`);
    console.log(`   Status: ${newUser.status}`);
    console.log(`   ID: ${newUser.id}`);

    // ============================================================
    // Example 2: Get User Details
    // ============================================================
    console.log('\n🔍 Example 2: Get user details');
    console.log('─'.repeat(60));
    
    const user = await client.users.get('alice@company.com');
    
    console.log(`✅ User: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);

    // ============================================================
    // Example 3: Get User with Roles and Teams
    // ============================================================
    console.log('\n👤 Example 3: Get user with roles and teams');
    console.log('─'.repeat(60));
    
    const userWithDetails = await client.users.get('alice@company.com', {
      fields: ['roles', 'teams'] // Include roles and teams
    });
    
    console.log(`✅ User: ${userWithDetails.email}`);
    if (userWithDetails.roles && userWithDetails.roles.length > 0) {
      console.log(`   Roles: ${userWithDetails.roles.map(r => r.name).join(', ')}`);
    }
    if (userWithDetails.teams && userWithDetails.teams.length > 0) {
      console.log(`   Teams: ${userWithDetails.teams.map(t => t.name).join(', ')}`);
    }

    // ============================================================
    // Example 4: Update User Roles
    // ============================================================
    console.log('\n✏️  Example 4: Update user roles');
    console.log('─'.repeat(60));
    
    const updatedUser = await client.users.update('alice@company.com', {
      roles: ['Admin', 'Developer'] // Replace roles
    });
    
    console.log(`✅ Updated roles for: ${updatedUser.email}`);
    console.log(`   Updated at: ${updatedUser.updatedAt.toLocaleTimeString()}`);

    // ============================================================
    // Example 5: Update User Teams
    // ============================================================
    console.log('\n🏢 Example 5: Update user teams');
    console.log('─'.repeat(60));
    
    await client.users.update('alice@company.com', {
      teams: ['platform-team', 'security-team'] // Replace teams
    });
    
    console.log('✅ Updated teams for user');

    // ============================================================
    // Example 6: Update Both Roles and Teams
    // ============================================================
    console.log('\n🔄 Example 6: Update roles and teams together');
    console.log('─'.repeat(60));
    
    await client.users.update('bob@company.com', {
      roles: ['Developer'],
      teams: ['frontend-team']
    });
    
    console.log('✅ Updated user roles and teams');

    // ============================================================
    // Example 7: List All Users
    // ============================================================
    console.log('\n📋 Example 7: List all users');
    console.log('─'.repeat(60));
    
    const users = await client.users.list();
    
    console.log(`✅ Found ${users.length} users:`);
    users.slice(0, 5).forEach((u) => {
      console.log(`   - ${u.email} (${u.status})`);
    });
    if (users.length > 5) {
      console.log(`   ... and ${users.length - 5} more`);
    }

    // ============================================================
    // Example 8: List Users with Roles and Teams
    // ============================================================
    console.log('\n👥 Example 8: List users with roles and teams');
    console.log('─'.repeat(60));
    
    const usersWithDetails = await client.users.list({
      fields: ['roles', 'teams']
    });
    
    console.log(`✅ Found ${usersWithDetails.length} users with details:`);
    usersWithDetails.slice(0, 3).forEach((u) => {
      console.log(`   - ${u.email}`);
      if (u.roles && u.roles.length > 0) {
        console.log(`     Roles: ${u.roles.map(r => r.name).join(', ')}`);
      }
      if (u.teams && u.teams.length > 0) {
        console.log(`     Teams: ${u.teams.map(t => t.name).join(', ')}`);
      }
    });

    // ============================================================
    // Example 9: Filter Users by Status
    // ============================================================
    console.log('\n🔍 Example 9: Filter users by status');
    console.log('─'.repeat(60));
    
    const allUsers = await client.users.list();
    
    // Filter verified users
    const verifiedUsers = allUsers.filter(u => u.status === 'VERIFIED');
    console.log(`✅ Verified users: ${verifiedUsers.length}`);
    
    // Filter pending users
    const pendingUsers = allUsers.filter(u => u.status === 'PENDING');
    console.log(`   Pending users: ${pendingUsers.length}`);

    // ============================================================
    // Example 10: User Statistics
    // ============================================================
    console.log('\n📊 Example 10: User statistics');
    console.log('─'.repeat(60));
    
    const stats = {
      total: users.length,
      verified: users.filter(u => u.status === 'VERIFIED').length,
      pending: users.filter(u => u.status === 'PENDING').length,
      withPicture: users.filter(u => u.picture).length,
    };
    
    console.log('✅ User Statistics:');
    console.log(`   Total Users: ${stats.total}`);
    console.log(`   Verified: ${stats.verified}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   With Profile Picture: ${stats.withPicture}`);

    // ============================================================
    // Example 11: Delete a User
    // ============================================================
    console.log('\n🗑️  Example 11: Delete a user');
    console.log('─'.repeat(60));
    
    // Note: Uncomment to actually delete
    // await client.users.delete('user-to-delete@company.com');
    // console.log('✅ User deleted');
    console.log('⚠️  Delete operation commented out for safety');
    console.log('   Uncomment in code to enable user deletion');

    console.log('\n━'.repeat(60));
    console.log('✅ User management demonstration complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();


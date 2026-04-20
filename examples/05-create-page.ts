import { PortClient } from '../src';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function createExamplePage() {
  console.log('🚀 Creating an example page in Port...');

  const client = new PortClient({
    credentials: {
      clientId: (process.env.PORT_CLIENT_ID || '').trim(),
      clientSecret: (process.env.PORT_CLIENT_SECRET || '').trim(),
    },
    region: (process.env.PORT_REGION || 'eu') as 'eu' | 'us',
  });

  // Use a unique but recognizable identifier
  const pageId = `sdk-example-${Date.now()}`;

  try {
    const page = await client.pages.create({
      identifier: pageId,
      title: '🇪🇺 SDK Example Page (EU)',
      description: 'Created via Port SDK in the EU region',
      widgets: [],
      sidebar: 'catalog',
    } as any);

    // Force visibility via a follow-up patch
    await client.pages.update(pageId, {
      showInSidebar: true,
    } as any);

    console.log('\n✅ SUCCESS!');
    console.log(`- Page Identifier: ${page.identifier}`);
    console.log(`\n🔗 DIRECT LINK: https://app.eu.getport.io/page/${page.identifier}`);
    console.log('\nNote: Since your account is in the EU region, please ensure you are logged into:');
    console.log('👉 https://app.eu.getport.io');
    console.log('\nOnce logged in, look for this page in the "Software Catalog" sidebar section.');

  } catch (error: any) {
    console.error('\n❌ Failed to create page:');
    console.error(error.message);
    if (error.body) {
      console.error('Error Details:', JSON.stringify(error.body, null, 2));
    }
  }
}

createExamplePage();

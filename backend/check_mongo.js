const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://localhost:27017/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('campconnect_db');
    const roles = await db.collection('roles').find().toArray();
    console.log('Roles found:', JSON.stringify(roles, null, 2));
    
    if (roles.length === 0) {
        console.log('No roles found! Creating them...');
        await db.collection('roles').insertMany([
            { name: 'ROLE_USER', _class: 'com.campconnect.model.Role' },
            { name: 'ROLE_ADMIN', _class: 'com.campconnect.model.Role' }
        ]);
        console.log('Roles created successfully.');
    }
    
    const users = await db.collection('users').find().toArray();
    console.log('Users found:', users.length);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

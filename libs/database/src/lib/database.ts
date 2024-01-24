import { Db, MongoClient } from 'mongodb';
import { User } from '@lems/types';
import { randomString } from '@lems/utils/random';

const connectionString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';

const initDbClient = async () => {
  const client = new MongoClient(connectionString, {
    tlsAllowInvalidCertificates: process.env.NODE_ENV === 'production'
  });

  try {
    await client.connect();
    console.log('🚀 MongoDB Client connected.');
  } catch (err) {
    console.error('❌ Unable to connect to mongodb: ', err);
  }

  return client;
};

const client = await initDbClient();
// Add client specific code here (listeners etc)

const db: Db = client.db('lems');

const admins = db.collection<User>('users');
admins.findOne({}).then(user => {
  if (!user) {
    const adminUsername = 'admin';
    const adminPassword = randomString(8);
    admins
      .insertOne({
        username: adminUsername,
        isAdmin: true,
        password: adminPassword,
        lastPasswordSetDate: new Date()
      })
      .then(() => {
        console.log(`⚙️ Setup initial admin user with details - ${adminUsername}:${adminPassword}`);
      });
  }
});

export default db;

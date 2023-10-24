import { MongoClient } from 'mongodb';
import { User } from '@lems/types';
import { randomString } from '@lems/utils/random';

const connectionString = process.env.MONGODB_URI || 'mongodb://127.0.0.1';
const port = process.env.MONGODB_PORT || 27017;

const initDbClient = async () => {
  const client = new MongoClient(`${connectionString}:${port}`);

  try {
    await client.connect();
  } catch (err) {
    console.error('❌ Unable to connect to mongodb: ', err);
  }
  console.log('🚀 MongoDB Client connected.');

  return client;
};

const client = await initDbClient();
// Add client specific code here (listeners etc)

const db = client.db('lems');

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

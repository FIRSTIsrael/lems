import { MongoClient } from 'mongodb';

const connectionString = process.env.MONGODB_URI || 'mongodb://127.0.0.1';
const port = process.env.MONGODB_PORT || 27101;

const initDbClient = async () => {
  const client = new MongoClient(`${connectionString}:${port}`);

  try {
    await client.connect();
  } catch (err) {
    console.error('❌ Unable to connect to mongodb: ', err);
  }

  return client;
};

const client = await initDbClient();
// Add client specific code here (listeners etc)

const db = client.db('lems');
export default db;

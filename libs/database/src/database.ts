import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';
import { UsersRepository } from './repositories/users';
import { DatabaseSchema } from './schema/index';

const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.PG_PORT || '5432');
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'postgres';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'lems-local';

export class Database {
  private kysely: Kysely<DatabaseSchema>;
  private mongoClient: MongoClient;
  private mongoDB: Db;

  public users: UsersRepository;

  constructor() {
    this.kysely = new Kysely<DatabaseSchema>({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: PG_HOST,
          port: PG_PORT,
          user: PG_USER,
          password: PG_PASSWORD,
          database: DB_NAME
        })
      })
    });
    this.mongoClient = new MongoClient(MONGODB_URI, {
      tlsAllowInvalidCertificates: true
    });
    this.mongoDB = this.mongoClient.db(DB_NAME);

    this.users = new UsersRepository(this.kysely);
  }

  async connect(): Promise<void> {
    try {
      // Test PostgreSQL connection
      console.log('Connecting to PostgreSQL...');
      const tables = await this.kysely.introspection.getTables();
      if (tables.length === 0) {
        console.warn('No tables found in PostgreSQL database. Ensure the database is initialized.');
      }
      console.log(`✓ PostgreSQL connected successfully with ${tables.length} tables.`);
    } catch (error) {
      console.error('✗ Failed to connect to PostgreSQL:', error);
      throw new Error(`PostgreSQL connection failed: ${error}`);
    }

    try {
      // Test MongoDB connection
      await this.mongoClient.connect();
      await this.mongoDB.admin().ping();
      console.log('✓ MongoDB connected successfully');
    } catch (error) {
      console.error('✗ Failed to connect to MongoDB:', error);
      throw new Error(`MongoDB connection failed: ${error}`);
    }

    console.log('🚀 Database connections established successfully');
  }

  async disconnect(): Promise<void> {
    await this.kysely.destroy();
    await this.mongoClient.close();
  }
}

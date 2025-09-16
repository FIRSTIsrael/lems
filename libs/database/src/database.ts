import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';
import { AdminsRepository } from './repositories/admins';
import { SeasonsRepository } from './repositories/seasons';
import { TeamsRepository } from './repositories/teams';
import { KyselyDatabaseSchema } from './schema/kysely';
import { ObjectStorage } from './object-storage';
import { EventsRepository } from './repositories/events';
import { DivisionsRepository } from './repositories/divisions';
import { RoomsRepository } from './repositories/rooms';
import { TablesRepository } from './repositories/tables';
import { JudgingSessionsRepository } from './repositories/judging-sessions';

const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.PG_PORT || '5432');
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'postgres';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'lems-local';

const DIGITALOCEAN_ENDPOINT = process.env.DIGITALOCEAN_ENDPOINT || 'nyc3.digitaloceanspaces.com';
const DIGITALOCEAN_SPACE = process.env.DIGITALOCEAN_SPACE || 'lems-dev';
const DIGITALOCEAN_KEY = process.env.DIGITALOCEAN_KEY || '';
const DIGITALOCEAN_SECRET = process.env.DIGITALOCEAN_SECRET || '';

export class Database {
  private kysely: Kysely<KyselyDatabaseSchema>;
  private mongoClient: MongoClient;
  private mongoDb: Db;
  private space: ObjectStorage;

  public admins: AdminsRepository;
  public seasons: SeasonsRepository;
  public teams: TeamsRepository;
  public events: EventsRepository;
  public divisions: DivisionsRepository;
  public rooms: RoomsRepository;
  public judgingSessions: JudgingSessionsRepository;
  public tables: TablesRepository;

  constructor() {
    this.kysely = new Kysely<KyselyDatabaseSchema>({
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
    this.mongoDb = this.mongoClient.db(DB_NAME);

    this.space = new ObjectStorage({
      endpoint: DIGITALOCEAN_ENDPOINT,
      space: DIGITALOCEAN_SPACE,
      accessKey: DIGITALOCEAN_KEY,
      secretKey: DIGITALOCEAN_SECRET
    });

    this.admins = new AdminsRepository(this.kysely);
    this.seasons = new SeasonsRepository(this.kysely, this.space);
    this.teams = new TeamsRepository(this.kysely, this.space);
    this.events = new EventsRepository(this.kysely);
    this.divisions = new DivisionsRepository(this.kysely, this.space);
    this.rooms = new RoomsRepository(this.kysely);
    this.judgingSessions = new JudgingSessionsRepository(this.kysely, this.mongoDb);
    this.tables = new TablesRepository(this.kysely);
  }

  async connect(): Promise<void> {
    try {
      // Test PostgreSQL connection
      console.log('Connecting to PostgreSQL...');
      const tables = await this.kysely.introspection.getTables();
      if (tables.length === 0) {
        console.warn('No tables found in PostgreSQL database. Ensure the database is initialized.');
      }
      console.log(`🐘 PostgreSQL connected successfully with ${tables.length} tables.`);
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error);
      throw new Error(`PostgreSQL connection failed: ${error}`);
    }

    try {
      // Test MongoDB connection
      await this.mongoClient.connect();
      await this.mongoDb.admin().ping();
      console.log('🌲 MongoDB connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw new Error(`MongoDB connection failed: ${error}`);
    }

    console.log('🚀 Database connections established successfully');
  }

  async disconnect(): Promise<void> {
    await this.kysely.destroy();
    await this.mongoClient.close();
  }
}

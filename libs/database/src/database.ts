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
import { RobotGameMatchesRepository } from './repositories/robot-game-matches';
import { AwardsRepository } from './repositories/awards';
import { EventUsersRepository } from './repositories/event-users';
import { RubricsRepository } from './repositories/rubrics';
import { ScoresheetsRepository } from './repositories/scoresheets';
import { JudgingDeliberationsRepository } from './repositories/judging-deliberations';
import { FinalDeliberationsRepository } from './repositories/final-deliberations';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.PG_PORT || '5432');
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'postgres';
const PG_SSL_CA = process.env.PG_SSL_CA;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'lems-local';

const DIGITALOCEAN_ENDPOINT = process.env.DIGITALOCEAN_ENDPOINT || 'nyc3.digitaloceanspaces.com';
const DIGITALOCEAN_SPACE = process.env.DIGITALOCEAN_SPACE || 'lems-dev';
const DIGITALOCEAN_KEY = process.env.DIGITALOCEAN_KEY || '';
const DIGITALOCEAN_SECRET = process.env.DIGITALOCEAN_SECRET || '';

/**
 * Low-level database access for advanced queries.
 * Available via `db.raw` for use in GraphQL resolvers and other scenarios
 * where repository methods don't provide enough flexibility.
 */
export interface DatabaseRawAccess {
  /** Kysely query builder for PostgreSQL */
  sql: Kysely<KyselyDatabaseSchema>;
  /** MongoDB database instance */
  mongo: Db;
  /** Object storage client for S3-compatible storage (DigitalOcean Spaces) */
  storage: ObjectStorage;
}

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
  public eventUsers: EventUsersRepository;

  public rooms: RoomsRepository;
  public judgingSessions: JudgingSessionsRepository;
  public judgingDeliberations: JudgingDeliberationsRepository;
  public finalDeliberations: FinalDeliberationsRepository;
  public rubrics: RubricsRepository;

  public tables: TablesRepository;
  public robotGameMatches: RobotGameMatchesRepository;
  public scoresheets: ScoresheetsRepository;

  public awards: AwardsRepository;

  /**
   * Direct access to low-level database connections for advanced queries.
   * Use this when repository methods don't provide enough flexibility,
   * such as in GraphQL resolvers with complex filtering requirements.
   *
   * @property sql - Kysely query builder for PostgreSQL
   * @property mongo - MongoDB database instance
   * @property storage - Object storage client for S3-compatible storage
   */
  public get raw(): DatabaseRawAccess {
    return {
      sql: this.kysely,
      mongo: this.mongoDb,
      storage: this.space
    };
  }
  constructor() {
    this.kysely = new Kysely<KyselyDatabaseSchema>({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: PG_HOST,
          port: PG_PORT,
          user: PG_USER,
          password: PG_PASSWORD,
          database: DB_NAME,
          ssl: IS_PRODUCTION
            ? {
                ca: PG_SSL_CA,
                rejectUnauthorized: true
              }
            : false
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
    this.divisions = new DivisionsRepository(this.kysely, this.space, this.mongoDb);
    this.eventUsers = new EventUsersRepository(this.kysely);

    this.rooms = new RoomsRepository(this.kysely);
    this.judgingSessions = new JudgingSessionsRepository(this.kysely, this.mongoDb);
    this.judgingDeliberations = new JudgingDeliberationsRepository(this.kysely);
    this.finalDeliberations = new FinalDeliberationsRepository(this.mongoDb);
    this.rubrics = new RubricsRepository(this.kysely, this.mongoDb);

    this.tables = new TablesRepository(this.kysely);
    this.robotGameMatches = new RobotGameMatchesRepository(this.kysely, this.mongoDb);
    this.scoresheets = new ScoresheetsRepository(this.kysely, this.mongoDb);

    this.awards = new AwardsRepository(this.kysely);
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

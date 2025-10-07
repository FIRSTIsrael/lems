import { promises as fs } from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Pool } from 'pg';
import { Kysely, Migrator, PostgresDialect, MigrationProvider, Migration } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';
import { syncAllSequences } from '../utils/sequence-sync.js';

// Load environment variables with defaults
const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.PG_PORT || '5432');
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'postgres';
const PG_DATABASE = process.env.PG_DATABASE || 'lems-local';
const PG_SSL_CA = process.env.PG_SSL_CA;

class ESMFileMigrationProvider implements MigrationProvider {
  constructor(private relativePath: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    const resolvedPath = path.resolve(__dirname, this.relativePath);
    const files = await fs.readdir(resolvedPath);

    for (const fileName of files) {
      if (!fileName.endsWith('.js')) {
        continue;
      }

      const importPath = path
        .join(this.relativePath, fileName)
        .replace(new RegExp('\\\\', 'g'), '/');
      const migration = await import(importPath);
      const migrationKey = fileName.substring(0, fileName.lastIndexOf('.'));

      migrations[migrationKey] = migration;
    }

    return migrations;
  }
}

async function migrateToLatest() {
  console.log(`Connecting to PostgreSQL at ${PG_HOST}:${PG_PORT} as ${PG_USER}`);
  console.log(`Database: ${PG_DATABASE}`);

  const db = new Kysely<KyselyDatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: PG_HOST,
        port: PG_PORT,
        user: PG_USER,
        password: PG_PASSWORD,
        database: PG_DATABASE,
        ssl: PG_SSL_CA
          ? {
              ca: PG_SSL_CA,
              rejectUnauthorized: true
            }
          : false
      })
    })
  });

  const migrator = new Migrator({
    db,
    provider: new ESMFileMigrationProvider('../migrations')
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach(it => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  const successfulMigrations = results?.filter(it => it.status === 'Success') || [];

  console.log(
    `\n🔄 Synchronizing sequences after ${successfulMigrations.length} successful migration(s)...`
  );
  try {
    await syncAllSequences(db, { verbose: false });
    console.log('✅ Sequences synchronized successfully');
  } catch (syncError) {
    console.warn('⚠️  Warning: Failed to sync sequences after migrations:', syncError);
    console.warn(
      '   You may need to run sequence sync manually if you encounter duplicate key errors'
    );
  }

  await db.destroy();
}

migrateToLatest();

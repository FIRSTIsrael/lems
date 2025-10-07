import { promises as fs } from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Pool } from 'pg';
import { Kysely, Migrator, PostgresDialect, MigrationProvider, Migration, sql } from 'kysely';
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

async function checkDatabasePermissions(db: Kysely<KyselyDatabaseSchema>): Promise<boolean> {
  try {
    console.log('\n🔍 Verifying database permissions...');

    const result = await sql<{
      schema_name: string;
      can_create: boolean;
      can_use: boolean;
    }>`
      SELECT 
        nspname as schema_name,
        has_schema_privilege(current_user, nspname, 'CREATE') as can_create,
        has_schema_privilege(current_user, nspname, 'USAGE') as can_use
      FROM pg_namespace
      WHERE nspname = 'public'
    `
      .execute(db)
      .then(result => result.rows[0]);

    if (!result) {
      console.warn('⚠️  Could not verify schema permissions');
      return true; // Continue anyway
    }

    console.log(`  Schema: ${result.schema_name}`);
    console.log(`  CREATE permission: ${result.can_create ? '✅' : '❌'}`);
    console.log(`  USAGE permission:  ${result.can_use ? '✅' : '❌'}`);

    if (!result.can_create) {
      console.error('\n❌ ERROR: Insufficient permissions!');
      console.error(`   User '${PG_USER}' does not have CREATE permission on schema 'public'`);
      console.error('   This is required to run migrations.\n');
      console.error('   To fix this, a database administrator needs to run:');
      console.error(`   GRANT CREATE ON SCHEMA public TO "${PG_USER}";\n`);
      return false;
    }

    console.log('✅ Permissions verified\n');
    return true;
  } catch (err) {
    const error = err as Error;
    console.warn(`⚠️  Could not verify permissions: ${error.message}`);
    console.warn('   Continuing anyway...\n');
    return true; // Continue if permission check itself fails
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

  // Check permissions before attempting migrations
  const hasPermissions = await checkDatabasePermissions(db);
  if (!hasPermissions) {
    await db.destroy();
    process.exit(1);
  }

  const migrator = new Migrator({
    db,
    provider: new ESMFileMigrationProvider('../migrations')
  });

  console.log('Running migrations...');

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach(it => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('\n❌ Migration failed!');
    console.error(error);

    // Check if it's a permission error
    const errorObj = error as { code?: string };
    if (errorObj.code === '42501') {
      console.error('\n💡 This appears to be a permission error (code 42501).');
      console.error('   The database user may lack necessary privileges.');
      console.error('   Please verify that the user has CREATE permission on the schema.');
    }

    console.debug(results);
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

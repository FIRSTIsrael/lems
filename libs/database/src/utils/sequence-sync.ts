import { Kysely, sql } from 'kysely';

/**
 * Interface representing a table with a serial primary key that needs sequence synchronization
 */
interface TableWithSequence {
  tableName: string;
  sequenceName: string;
  pkColumn: string;
}

/**
 * List of all tables that have serial primary keys and need sequence synchronization
 * This should be kept in sync with your migration files
 */
const TABLES_WITH_SEQUENCES: TableWithSequence[] = [
  { tableName: 'admins', sequenceName: 'admins_pk_seq', pkColumn: 'pk' },
  { tableName: 'admin_permissions', sequenceName: 'admin_permissions_pk_seq', pkColumn: 'pk' },
  { tableName: 'seasons', sequenceName: 'seasons_pk_seq', pkColumn: 'pk' },
  { tableName: 'events', sequenceName: 'events_pk_seq', pkColumn: 'pk' },
  { tableName: 'divisions', sequenceName: 'divisions_pk_seq', pkColumn: 'pk' },
  { tableName: 'event_users', sequenceName: 'event_users_pk_seq', pkColumn: 'pk' },
  {
    tableName: 'event_user_divisions',
    sequenceName: 'event_user_divisions_pk_seq',
    pkColumn: 'pk'
  },
  { tableName: 'admin_events', sequenceName: 'admin_events_pk_seq', pkColumn: 'pk' },
  { tableName: 'teams', sequenceName: 'teams_pk_seq', pkColumn: 'pk' },
  { tableName: 'team_divisions', sequenceName: 'team_divisions_pk_seq', pkColumn: 'pk' },
  {
    tableName: 'team_division_notifications',
    sequenceName: 'team_division_notifications_pk_seq',
    pkColumn: 'pk'
  },
  { tableName: 'judging_rooms', sequenceName: 'judging_rooms_pk_seq', pkColumn: 'pk' },
  { tableName: 'judging_sessions', sequenceName: 'judging_sessions_pk_seq', pkColumn: 'pk' },
  { tableName: 'robot_game_tables', sequenceName: 'robot_game_tables_pk_seq', pkColumn: 'pk' },
  { tableName: 'robot_game_matches', sequenceName: 'robot_game_matches_pk_seq', pkColumn: 'pk' },
  {
    tableName: 'robot_game_match_participants',
    sequenceName: 'robot_game_match_participants_pk_seq',
    pkColumn: 'pk'
  },
  { tableName: 'awards', sequenceName: 'awards_pk_seq', pkColumn: 'pk' }
];

/**
 * Synchronizes all PostgreSQL sequences to match the current maximum values in their respective tables.
 * This prevents duplicate key errors when inserting new records after manual data manipulation.
 *
 * @param db - Kysely database instance
 * @param options - Configuration options
 * @param options.verbose - Whether to log detailed information about each sequence sync
 * @param options.dryRun - If true, only shows what would be done without making changes
 */
export async function syncAllSequences(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: Kysely<any>,
  options: { verbose?: boolean; dryRun?: boolean } = {}
): Promise<void> {
  const { verbose = false, dryRun = false } = options;

  console.log(`🔄 ${dryRun ? 'Checking' : 'Synchronizing'} PostgreSQL sequences...`);

  for (const table of TABLES_WITH_SEQUENCES) {
    try {
      await syncSequenceForTable(db, table, { verbose, dryRun });
    } catch (error) {
      console.error(`❌ Failed to sync sequence for table ${table.tableName}:`, error);
      // Continue with other tables even if one fails
    }
  }

  console.log(`✅ Sequence ${dryRun ? 'check' : 'synchronization'} completed successfully`);
}

/**
 * Synchronizes a single table's sequence to match the current maximum value
 *
 * @param db - Kysely database instance
 * @param table - Table configuration object
 * @param options - Configuration options
 */
async function syncSequenceForTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: Kysely<any>,
  table: TableWithSequence,
  options: { verbose?: boolean; dryRun?: boolean } = {}
): Promise<void> {
  const { verbose = false, dryRun = false } = options;

  // First check if the table exists
  const tableExists = await checkTableExists(db, table.tableName);
  if (!tableExists) {
    if (verbose) {
      console.log(`⏭️  Skipping ${table.tableName} - table does not exist`);
    }
    return;
  }

  // Get the current maximum value in the table
  const result = await db
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .selectFrom(table.tableName as any)
    .select(sql<number>`COALESCE(MAX(${sql.raw(table.pkColumn)}), 0)`.as('max_value'))
    .executeTakeFirst();

  const maxValue = result?.max_value || 0;

  // Get the current sequence value
  const seqResult = await db
    .selectFrom(sql`${sql.raw(table.sequenceName)}`.as('seq'))
    .select(sql<number>`last_value`.as('current_value'))
    .executeTakeFirst();

  const currentSeqValue = seqResult?.current_value || 0;

  // Calculate the next value the sequence should have
  const nextValue = maxValue + 1;

  if (verbose || currentSeqValue < nextValue) {
    console.log(`📊 Table: ${table.tableName}`);
    console.log(`   Max PK value: ${maxValue}`);
    console.log(`   Current sequence value: ${currentSeqValue}`);
    console.log(`   Target sequence value: ${nextValue}`);
  }

  // Only update if the sequence is behind
  if (currentSeqValue < nextValue) {
    if (dryRun) {
      console.log(`🔧 Would sync ${table.sequenceName} to ${nextValue}`);
    } else {
      // Use setval to set the sequence to the correct value
      await sql`SELECT setval(${table.sequenceName}, ${nextValue}, false)`.execute(db);
      console.log(`✅ Synced ${table.sequenceName} to ${nextValue}`);
    }
  } else if (verbose) {
    console.log(`✅ ${table.sequenceName} is already in sync`);
  }
}

/**
 * Check if a table exists in the database
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkTableExists(db: Kysely<any>, tableName: string): Promise<boolean> {
  try {
    const result = await db
      .selectFrom(sql`information_schema.tables`.as('tables'))
      .select(sql<string>`table_name`.as('table_name'))
      .where(sql`table_schema`, '=', 'public')
      .where(sql`table_name`, '=', tableName)
      .executeTakeFirst();

    return !!result;
  } catch (error) {
    console.warn(`Warning: Could not check if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Synchronizes a specific table's sequence
 * Useful for manual sequence fixes or when you know a specific table is problematic
 *
 * @param db - Kysely database instance
 * @param tableName - Name of the table to sync
 * @param options - Configuration options
 */
export async function syncSequenceForTableByName(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: Kysely<any>,
  tableName: string,
  options: { verbose?: boolean; dryRun?: boolean } = {}
): Promise<void> {
  const table = TABLES_WITH_SEQUENCES.find(t => t.tableName === tableName);

  if (!table) {
    throw new Error(
      `Table ${tableName} not found in sequence configuration. Available tables: ${TABLES_WITH_SEQUENCES.map(t => t.tableName).join(', ')}`
    );
  }

  await syncSequenceForTable(db, table, options);
}

/**
 * Get the status of all sequences without making any changes
 * Useful for debugging sequence issues
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSequenceStatus(db: Kysely<any>): Promise<
  Array<{
    tableName: string;
    sequenceName: string;
    maxPkValue: number;
    currentSeqValue: number;
    isInSync: boolean;
    nextValue: number;
  }>
> {
  const status = [];

  for (const table of TABLES_WITH_SEQUENCES) {
    try {
      const tableExists = await checkTableExists(db, table.tableName);
      if (!tableExists) {
        continue;
      }

      // Get max PK value
      const result = await db
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .selectFrom(table.tableName as any)
        .select(sql<number>`COALESCE(MAX(${sql.raw(table.pkColumn)}), 0)`.as('max_value'))
        .executeTakeFirst();

      const maxPkValue = result?.max_value || 0;

      // Get current sequence value
      const seqResult = await db
        .selectFrom(sql`${sql.raw(table.sequenceName)}`.as('seq'))
        .select(sql<number>`last_value`.as('current_value'))
        .executeTakeFirst();

      const currentSeqValue = seqResult?.current_value || 0;
      const nextValue = maxPkValue + 1;

      status.push({
        tableName: table.tableName,
        sequenceName: table.sequenceName,
        maxPkValue,
        currentSeqValue,
        isInSync: currentSeqValue >= nextValue,
        nextValue
      });
    } catch (error) {
      console.error(`Error getting status for ${table.tableName}:`, error);
    }
  }

  return status;
}

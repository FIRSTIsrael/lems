/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('robot_game_tables')
    .addColumn('pair_key', 'varchar(64)')
    .addColumn('side', sql`char(1)`)
    .execute();

  await sql`
    ALTER TABLE robot_game_tables
    ADD CONSTRAINT ck_robot_game_tables_pair
    CHECK ((pair_key IS NULL) = (side IS NULL) AND (side IS NULL OR side IN ('A', 'B')))
  `.execute(db);

  await db.schema
    .alterTable('robot_game_tables')
    .addUniqueConstraint('uk_robot_game_tables_pair_side', ['pair_key', 'side'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('robot_game_tables')
    .dropConstraint('uk_robot_game_tables_pair_side')
    .execute();

  await db.schema
    .alterTable('robot_game_tables')
    .dropConstraint('ck_robot_game_tables_pair')
    .execute();

  await db.schema
    .alterTable('robot_game_tables')
    .dropColumn('pair_key')
    .dropColumn('side')
    .execute();
}

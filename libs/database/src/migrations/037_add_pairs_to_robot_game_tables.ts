/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from 'node:crypto';
import { Kysely, sql } from 'kysely';

const PASSWORD_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Kept inline so this migration does not depend on backend code.
const generatePassword = () =>
  Array.from({ length: 4 }, () => PASSWORD_CHARSET[randomInt(PASSWORD_CHARSET.length)]).join('');

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('robot_game_tables')
    .addColumn('pair_key', 'uuid')
    .addColumn('side', 'char(1)')
    .execute();

  // Pair tables in pk order per division: (1st, 2nd), (3rd, 4th), ...
  await sql`
    WITH numbered AS (
      SELECT pk, division_id,
             row_number() OVER (PARTITION BY division_id ORDER BY pk) - 1 AS rn
      FROM robot_game_tables
    ), keys AS (
      SELECT division_id, rn / 2 AS idx, gen_random_uuid() AS pair_key
      FROM numbered GROUP BY division_id, rn / 2
    )
    UPDATE robot_game_tables t
    SET pair_key = k.pair_key, side = CASE WHEN n.rn % 2 = 0 THEN 'A' ELSE 'B' END
    FROM numbered n JOIN keys k ON k.division_id = n.division_id AND k.idx = n.rn / 2
    WHERE t.pk = n.pk
  `.execute(db);

  // Divisions with an odd number of tables leave one table alone in its pair: add a partner.
  const leftovers = await db
    .selectFrom('robot_game_tables as t')
    .innerJoin('divisions as d', 'd.id', 't.division_id')
    .select(['t.division_id', 't.name', 't.pair_key', 'd.event_id'])
    .where(
      't.pair_key',
      'in',
      db
        .selectFrom('robot_game_tables')
        .select('pair_key')
        .groupBy('pair_key')
        .having(sql`count(*)`, '=', 1)
    )
    .execute();

  for (const leftover of leftovers) {
    const partnerName = `${leftover.name} (B)`;
    const partner = await db
      .insertInto('robot_game_tables')
      .values({
        division_id: leftover.division_id,
        name: partnerName,
        pair_key: leftover.pair_key,
        side: 'B'
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    const referee = await db
      .insertInto('event_users')
      .values({
        event_id: leftover.event_id,
        role: 'referee',
        role_info: { tableId: partner.id },
        identifier: null,
        password: generatePassword()
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    await db
      .insertInto('event_user_divisions')
      .values({ user_id: referee.id, division_id: leftover.division_id })
      .execute();

    console.log(`Division ${leftover.division_id}: added partner table "${partnerName}"`);
  }

  await db.schema
    .alterTable('robot_game_tables')
    .alterColumn('pair_key', col => col.setNotNull())
    .alterColumn('side', col => col.setNotNull())
    .execute();

  await db.schema
    .alterTable('robot_game_tables')
    .addCheckConstraint('ck_robot_game_tables_side', sql`side IN ('A', 'B')`)
    .execute();

  await sql`
    ALTER TABLE robot_game_tables
      ADD CONSTRAINT uk_robot_game_tables_pair_side UNIQUE (pair_key, side)
  `.execute(db);

  await sql`
    -- An aggregate without GROUP BY always yields a row, so count(*) > 0 skips fully deleted pairs.
    CREATE FUNCTION check_robot_game_table_pair() RETURNS trigger AS $$
    DECLARE k uuid;
    BEGIN
      FOREACH k IN ARRAY ARRAY[OLD.pair_key, NEW.pair_key] LOOP
        CONTINUE WHEN k IS NULL;
        IF EXISTS (
          SELECT 1 FROM robot_game_tables WHERE pair_key = k
          HAVING count(*) > 0 AND (count(*) <> 2 OR count(DISTINCT division_id) <> 1)
        ) THEN
          RAISE EXCEPTION 'Table pair % must have exactly two tables in one division', k
            USING ERRCODE = '23514';
        END IF;
      END LOOP;
      RETURN NULL;
    END $$ LANGUAGE plpgsql
  `.execute(db);

  await sql`
    CREATE CONSTRAINT TRIGGER trg_robot_game_tables_full_pair
      AFTER INSERT OR UPDATE OR DELETE ON robot_game_tables
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION check_robot_game_table_pair()
  `.execute(db);
}

/**
 * Note: partner tables (and their referees) that `up` created for unpaired tables are not removed.
 */
export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS trg_robot_game_tables_full_pair ON robot_game_tables`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS check_robot_game_table_pair()`.execute(db);

  await db.schema
    .alterTable('robot_game_tables')
    .dropConstraint('uk_robot_game_tables_pair_side')
    .execute();
  await db.schema
    .alterTable('robot_game_tables')
    .dropConstraint('ck_robot_game_tables_side')
    .execute();
  await db.schema
    .alterTable('robot_game_tables')
    .dropColumn('pair_key')
    .dropColumn('side')
    .execute();
}

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create pit_maps table
  await db.schema
    .createTable('pit_maps')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('division_id', 'uuid', col =>
      col.notNull().references('divisions.id').onDelete('cascade')
    )
    .addColumn('map_image_url', 'text', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Create unique index on division_id (one pit map per division)
  await db.schema
    .createIndex('pit_maps_division_id_unique_idx')
    .on('pit_maps')
    .column('division_id')
    .unique()
    .execute();

  // Create pit_map_areas table
  await db.schema
    .createTable('pit_map_areas')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('pit_map_id', 'uuid', col =>
      col.notNull().references('pit_maps.id').onDelete('cascade')
    )
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('coordinates', 'jsonb', col => col.notNull())
    .addColumn('max_teams', 'integer', col => col.notNull())
    .addColumn('division_id', 'uuid', col => col.references('divisions.id').onDelete('set null'))
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Create index on pit_map_id for faster lookups
  await db.schema
    .createIndex('pit_map_areas_pit_map_id_idx')
    .on('pit_map_areas')
    .column('pit_map_id')
    .execute();

  // Create pit_map_assignments table
  await db.schema
    .createTable('pit_map_assignments')
    .addColumn('pk', 'serial', col => col.primaryKey())
    .addColumn('id', 'uuid', col =>
      col
        .notNull()
        .unique()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('pit_map_area_id', 'uuid', col =>
      col.notNull().references('pit_map_areas.id').onDelete('cascade')
    )
    .addColumn('team_id', 'uuid', col => col.notNull().references('teams.id').onDelete('cascade'))
    .addColumn('position_x', 'real', col => col.notNull())
    .addColumn('position_y', 'real', col => col.notNull())
    .addColumn('spot_number', 'integer', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Create unique index on team_id (one assignment per team)
  await db.schema
    .createIndex('pit_map_assignments_team_id_unique_idx')
    .on('pit_map_assignments')
    .column('team_id')
    .unique()
    .execute();

  // Create index on pit_map_area_id for faster lookups
  await db.schema
    .createIndex('pit_map_assignments_area_id_idx')
    .on('pit_map_assignments')
    .column('pit_map_area_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('pit_map_assignments').execute();
  await db.schema.dropTable('pit_map_areas').execute();
  await db.schema.dropTable('pit_maps').execute();
}

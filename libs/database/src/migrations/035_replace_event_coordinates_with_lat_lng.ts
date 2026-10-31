/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('events')
    .dropColumn('coordinates')
    .addColumn('latitude', 'double precision')
    .addColumn('longitude', 'double precision')
    .execute();

  await db.schema
    .alterTable('events')
    .addCheckConstraint('events_latitude_range', sql`latitude BETWEEN -90 AND 90`)
    .execute();

  await db.schema
    .alterTable('events')
    .addCheckConstraint('events_longitude_range', sql`longitude BETWEEN -180 AND 180`)
    .execute();

  await db.schema
    .alterTable('events')
    .addCheckConstraint(
      'events_coordinates_complete',
      sql`(latitude IS NULL) = (longitude IS NULL)`
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('events').dropConstraint('events_coordinates_complete').execute();
  await db.schema.alterTable('events').dropConstraint('events_longitude_range').execute();
  await db.schema.alterTable('events').dropConstraint('events_latitude_range').execute();

  await db.schema
    .alterTable('events')
    .dropColumn('latitude')
    .dropColumn('longitude')
    .addColumn('coordinates', sql`point`)
    .execute();
}

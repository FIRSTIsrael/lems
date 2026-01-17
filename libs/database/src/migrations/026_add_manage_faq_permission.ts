/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add MANAGE_FAQ to the permission_type enum
  await sql`ALTER TYPE permission_type ADD VALUE 'MANAGE_FAQ'`.execute(db);
}

export async function down(_db: Kysely<any>): Promise<void> {
  // Note: PostgreSQL doesn't support removing enum values directly
  // This would require recreating the enum type and all dependent objects
  // For safety, we'll leave the enum value in place
  console.warn('Cannot remove enum value MANAGE_FAQ - PostgreSQL limitation');
}

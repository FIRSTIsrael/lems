/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add DEV_TOOLS to the permission_type enum
  await sql`ALTER TYPE permission_type ADD VALUE 'DEV_TOOLS'`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Note: PostgreSQL enums cannot have values removed directly
  // This migration is not reversible in a standard way
  // In production, you would need to:
  // 1. Create a new enum type without DEV_TOOLS
  // 2. Cast all columns to the new type
  // 3. Drop the old enum type
  // 4. Rename the new type
  // For now, we'll leave this as a no-op
  console.log('Cannot remove DEV_TOOLS permission from enum in down migration');
}

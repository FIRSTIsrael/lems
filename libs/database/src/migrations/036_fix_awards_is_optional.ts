/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

/**
 * Award names that are optional. Kept inline so this migration stays stable
 * if OPTIONAL_AWARDS in @lems/shared changes later.
 * Must match OPTIONAL_AWARDS at the time of this fix.
 */
const OPTIONAL_AWARD_NAMES = [
  'excellence-in-engineering',
  'lead-mentor',
  'volunteer-of-the-year',
  'breakthrough',
  'rising-all-star',
  'motivate',
  'judges-award',
  'impact'
];

/**
 * Awards were saved with is_optional inverted: names in OPTIONAL_AWARDS were
 * stored as mandatory, and every other award was stored as optional.
 * Rewrite the column from the award name so existing rows match the corrected writer.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('awards')
    .set({ is_optional: true })
    .where('name', 'in', OPTIONAL_AWARD_NAMES)
    .execute();

  await db
    .updateTable('awards')
    .set({ is_optional: false })
    .where('name', 'not in', OPTIONAL_AWARD_NAMES)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('awards')
    .set({ is_optional: false })
    .where('name', 'in', OPTIONAL_AWARD_NAMES)
    .execute();

  await db
    .updateTable('awards')
    .set({ is_optional: true })
    .where('name', 'not in', OPTIONAL_AWARD_NAMES)
    .execute();
}

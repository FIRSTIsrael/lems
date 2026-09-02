import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { sql } from 'kysely';

interface BlockedTimeSlotInput {
  start: string;
  end: string;
  reason?: string;
}

interface PracticeTablesConfigInput {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string;
  endTime: string;
  blockedTimeSlots: BlockedTimeSlotInput[];
}

interface UpdatePracticeTablesConfigArgs {
  input: PracticeTablesConfigInput;
}

export const updatePracticeTablesConfigResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdatePracticeTablesConfigArgs
> = async (_parent, { input }) => {
  const { divisionId, tableCount, slotDurationMinutes, startTime, endTime, blockedTimeSlots } = input;

  // Check if config exists
  const existingConfig = await db.raw.sql
    .selectFrom('practice_tables_config')
    .where('division_id', '=', divisionId)
    .selectAll()
    .executeTakeFirst();

  // Convert blockedTimeSlots to JSON string for JSONB column
  const blockedTimeSlotsJson = sql`${JSON.stringify(blockedTimeSlots)}::jsonb`;

  if (existingConfig) {
    // Update existing config
    await db.raw.sql
      .updateTable('practice_tables_config')
      .set({
        table_count: tableCount,
        slot_duration_minutes: slotDurationMinutes,
        start_time: startTime,
        end_time: endTime,
        blocked_time_slots: blockedTimeSlotsJson
      })
      .where('division_id', '=', divisionId)
      .execute();
  } else {
    // Create new config
    await db.raw.sql
      .insertInto('practice_tables_config')
      .values({
        division_id: divisionId,
        table_count: tableCount,
        slot_duration_minutes: slotDurationMinutes,
        start_time: startTime,
        end_time: endTime,
        blocked_time_slots: blockedTimeSlotsJson
      })
      .execute();
  }

  return {
    divisionId,
    tableCount,
    slotDurationMinutes,
    startTime,
    endTime,
    blockedTimeSlots
  };
};

import { GraphQLFieldResolver } from 'graphql';
import { sql } from 'kysely';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub.js';

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
  const { divisionId, tableCount, slotDurationMinutes, startTime, endTime, blockedTimeSlots } =
    input;

  // Check if config exists
  const existingConfig = await db.raw.sql
    .selectFrom('practice_tables_config')
    .where('division_id', '=', divisionId)
    .selectAll()
    .executeTakeFirst();

  if (existingConfig) {
    // Update existing config
    await db.raw.sql
      .updateTable('practice_tables_config')
      .set({
        table_count: tableCount,
        slot_duration_minutes: slotDurationMinutes,
        start_time: startTime,
        end_time: endTime,
        blocked_time_slots: sql`${JSON.stringify(blockedTimeSlots)}::jsonb`
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
        blocked_time_slots: sql`${JSON.stringify(blockedTimeSlots)}::jsonb`
      })
      .execute();
  }

  const config = {
    divisionId,
    tableCount,
    slotDurationMinutes,
    startTime,
    endTime,
    blockedTimeSlots
  };

  // Publish update to subscribers
  const pubSub = getRedisPubSub();
  await pubSub.publish(
    divisionId,
    RedisEventTypes.PRACTICE_TABLES_CONFIG_UPDATED,
    config as Record<string, unknown>
  );

  return config;
};

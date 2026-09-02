import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTablesConfigArgs {
  divisionId: string;
}

export const practiceTablesConfigResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  PracticeTablesConfigArgs
> = async (_parent, { divisionId }) => {
  const config = await db.raw.sql
    .selectFrom('practice_tables_config')
    .where('division_id', '=', divisionId)
    .selectAll()
    .executeTakeFirst();

  if (!config) {
    return null;
  }

  // Ensure blockedTimeSlots is always an array
  let blockedTimeSlots = [];
  if (config.blocked_time_slots) {
    if (typeof config.blocked_time_slots === 'string') {
      try {
        blockedTimeSlots = JSON.parse(config.blocked_time_slots);
      } catch (e) {
        console.error('Failed to parse blocked_time_slots:', e);
        blockedTimeSlots = [];
      }
    } else if (Array.isArray(config.blocked_time_slots)) {
      blockedTimeSlots = config.blocked_time_slots;
    }
  }

  return {
    divisionId: config.division_id,
    tableCount: config.table_count,
    slotDurationMinutes: config.slot_duration_minutes,
    startTime: config.start_time,
    endTime: config.end_time,
    blockedTimeSlots
  };
};

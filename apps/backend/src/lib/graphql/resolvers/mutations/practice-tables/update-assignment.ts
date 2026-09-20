import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';
import { getRedisPubSub } from '../../../../redis/redis-pubsub.js';
import { practiceTablesScheduleResolver } from '../../practice-tables/schedule.js';

interface UpdatePracticeTableSlotInput {
  divisionId: string;
  teamId: string | null;
  tableIndex: number;
  startTime: string;
}

interface UpdatePracticeTableAssignmentArgs {
  input: UpdatePracticeTableSlotInput;
}

export const updatePracticeTableAssignmentResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdatePracticeTableAssignmentArgs
> = async (_parent, { input }, context) => {
  const { divisionId, teamId, tableIndex, startTime } = input;

  // Find or create the slot
  const existingSlot = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .where('division_id', '=', divisionId)
    .where('table_number', '=', tableIndex)
    .where('start_time', '=', new Date(startTime))
    .selectAll()
    .executeTakeFirst();

  let result;

  if (existingSlot) {
    // Update existing slot
    result = await db.raw.sql
      .updateTable('practice_tables_schedule')
      .set({ team_id: teamId })
      .where('id', '=', existingSlot.id)
      .returning([
        'id',
        'division_id',
        'team_id',
        'table_number',
        'start_time',
        'end_time',
        'created_at'
      ])
      .executeTakeFirstOrThrow();
  } else {
    // Create new slot (only if assigning a team)
    if (!teamId) {
      throw new Error('Cannot create an empty slot. Slot does not exist.');
    }

    // Get slot duration from division settings
    const division = await db.raw.sql
      .selectFrom('divisions')
      .where('id', '=', divisionId)
      .select('practice_tables_settings')
      .executeTakeFirstOrThrow();

    const settings = division.practice_tables_settings as unknown as Record<string, unknown>;
    const slotDurationMinutes = settings.slotDurationMinutes as number;

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + slotDurationMinutes * 60 * 1000);

    result = await db.raw.sql
      .insertInto('practice_tables_schedule')
      .values({
        division_id: divisionId,
        team_id: teamId,
        table_number: tableIndex,
        start_time: startDate,
        end_time: endDate
      })
      .returning([
        'id',
        'division_id',
        'team_id',
        'table_number',
        'start_time',
        'end_time',
        'created_at'
      ])
      .executeTakeFirstOrThrow();
  }

  const assignment = {
    id: result.id,
    divisionId: result.division_id,
    teamId: result.team_id,
    tableIndex: result.table_number,
    startTime: result.start_time.toISOString(),
    endTime: result.end_time.toISOString(),
    createdAt: result.created_at.toISOString()
  };

  // Publish update to subscribers
  const allAssignments = await practiceTablesScheduleResolver(
    { divisionId },
    context,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any
  );

  const pubSub = getRedisPubSub();
  await pubSub.publish(
    divisionId,
    RedisEventTypes.PRACTICE_TABLE_ASSIGNMENTS_UPDATED,
    allAssignments as Record<string, unknown>
  );

  return assignment;
};

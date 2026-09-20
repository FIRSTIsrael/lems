import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { createPracticeTablesRepository } from '@lems/database';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';
import { getRedisPubSub } from '../../../../redis/redis-pubsub.js';
import { practiceTablesScheduleResolver } from '../../practice-tables/schedule.js';

const practiceTablesRepo = createPracticeTablesRepository(db.raw.sql);

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
  const startDate = new Date(startTime);
  const existingSlot = await practiceTablesRepo.getAssignment(divisionId, tableIndex, startDate);

  let result;

  if (existingSlot) {
    // Update existing slot
    result = await practiceTablesRepo.updateAssignment(divisionId, tableIndex, startDate, {
      team_id: teamId
    });
    if (!result) {
      throw new Error('Failed to update assignment');
    }
  } else {
    // Create new slot (only if assigning a team)
    if (!teamId) {
      throw new Error('Cannot create an empty slot. Slot does not exist.');
    }

    // Get slot duration from division settings
    const config = await practiceTablesRepo.getConfig(divisionId);
    if (!config) {
      throw new Error('Practice tables not configured for this division');
    }

    const endDate = new Date(startDate.getTime() + config.slotDurationMinutes * 60 * 1000);

    result = await practiceTablesRepo.createAssignment({
      division_id: divisionId,
      team_id: teamId,
      table_number: tableIndex,
      start_time: startDate,
      end_time: endDate
    });
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

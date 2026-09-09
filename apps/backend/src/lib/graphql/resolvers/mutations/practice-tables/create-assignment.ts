import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';
import { getRedisPubSub } from '../../../../redis/redis-pubsub.js';
import { practiceTableAssignmentsResolver } from '../../divisions/practice-table-assignments.js';

interface CreatePracticeTableAssignmentInput {
  divisionId: string;
  teamId: string;
  tableNumber: number;
  startTime: string;
  endTime: string;
}

interface CreatePracticeTableAssignmentArgs {
  input: CreatePracticeTableAssignmentInput;
}

export const createPracticeTableAssignmentResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  CreatePracticeTableAssignmentArgs
> = async (_parent, { input }, context) => {
  const { divisionId, teamId, tableNumber, startTime, endTime } = input;

  // Check for conflicts - same team at the same time
  const existingTeamAssignment = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .where('division_id', '=', divisionId)
    .where('team_id', '=', teamId)
    .where(eb =>
      eb.or([
        eb.and([
          eb('start_time', '<=', new Date(startTime)),
          eb('end_time', '>', new Date(startTime))
        ]),
        eb.and([eb('start_time', '<', new Date(endTime)), eb('end_time', '>=', new Date(endTime))]),
        eb.and([
          eb('start_time', '>=', new Date(startTime)),
          eb('end_time', '<=', new Date(endTime))
        ])
      ])
    )
    .selectAll()
    .executeTakeFirst();

  if (existingTeamAssignment) {
    throw new Error('Team already has a practice table assignment during this time slot');
  }

  // Find the existing empty slot by matching time components (hour/minute)
  // Slots are stored with epoch date but we need to match on time only
  const requestedStart = new Date(startTime);
  const requestedEnd = new Date(endTime);

  const allSlots = await db.raw.sql
    .selectFrom('practice_tables_schedule')
    .where('division_id', '=', divisionId)
    .where('table_number', '=', tableNumber)
    .where('team_id', 'is', null)
    .selectAll()
    .execute();

  // Find slot by matching hour and minute components
  const slot = allSlots.find(s => {
    const slotStart = new Date(s.start_time);
    const slotEnd = new Date(s.end_time);
    return (
      slotStart.getUTCHours() === requestedStart.getUTCHours() &&
      slotStart.getUTCMinutes() === requestedStart.getUTCMinutes() &&
      slotEnd.getUTCHours() === requestedEnd.getUTCHours() &&
      slotEnd.getUTCMinutes() === requestedEnd.getUTCMinutes()
    );
  });

  if (!slot) {
    throw new Error('No available slot found for this table and time');
  }

  // Update the slot with the team assignment
  const result = await db.raw.sql
    .updateTable('practice_tables_schedule')
    .set({ team_id: teamId })
    .where('id', '=', slot.id)
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

  const assignment = {
    id: result.id,
    divisionId: result.division_id,
    teamId: result.team_id!,
    tableNumber: result.table_number,
    startTime: result.start_time.toISOString(),
    endTime: result.end_time.toISOString(),
    createdAt: result.created_at.toISOString()
  };

  // Publish update to subscribers
  const allAssignments = await practiceTableAssignmentsResolver(
    { id: divisionId },
    { divisionId },
    context,
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

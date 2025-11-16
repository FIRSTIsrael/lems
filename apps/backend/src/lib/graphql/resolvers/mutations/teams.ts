import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface TeamArrivedArgs {
  teamId: string;
  divisionId: string;
}

interface TeamEvent {
  teamId: string;
  version: number;
}

/**
 * Resolver for Mutation.teamArrived
 * Marks that a team arrived at a division and publishes an event.
 * Returns minimal response containing only teamId and version.
 */
export const teamArrivedResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  TeamArrivedArgs,
  Promise<TeamEvent>
> = async (_root, { teamId, divisionId }, context) => {
  try {
    if (!context.user) {
      throw new Error('UNAUTHORIZED');
    }

    if (context.user.role !== 'pit-admin') {
      throw new Error('FORBIDDEN');
    }

    if (!context.user.divisions.includes(divisionId)) {
      throw new Error('FORBIDDEN');
    }

    const existing = await db.raw.sql
      .selectFrom('team_divisions')
      .select(['pk'])
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .where('arrived', '=', true as never) // TypeScript quirk workaround
      .executeTakeFirst();

    if (existing) {
      throw new Error(`Team with ID ${teamId} has already arrived at division ${divisionId}`);
    }

    const update: Record<string, unknown> = { arrived: true, arrived_at: new Date() };
    await db.raw.sql
      .updateTable('team_divisions')
      .set(update)
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .execute();

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.TEAM_ARRIVED, { teamId });

    return { teamId, version: -1 };
  } catch (error) {
    console.error(
      'Error updating team arrival status for team:',
      teamId,
      'in division:',
      divisionId,
      error
    );
    throw error;
  }
};

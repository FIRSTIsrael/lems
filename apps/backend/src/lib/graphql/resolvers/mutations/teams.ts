import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
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
  unknown,
  TeamArrivedArgs,
  Promise<TeamEvent>
> = async (_root, { teamId, divisionId }) => {
  try {
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

    const update: Record<string, unknown> = { arrived: true };
    await db.raw.sql
      .updateTable('team_divisions')
      .set(update)
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .execute();

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.TEAM_ARRIVED, { teamId });

    // Return minimal response - version will be 0 since this is the immediate response
    // The subscription will include the actual version from Redis
    return {
      teamId,
      version: 0
    };
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

import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface TeamArrivedArgs {
  teamId: string;
  divisionId: string;
}

interface TeamEvent {
  teamId: string;
}

/**
 * Resolver for Mutation.teamArrived
 * Marks that a team arrived at a division and publishes an event.
 */
export const teamArrivedResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  TeamArrivedArgs,
  Promise<TeamEvent>
> = async (_root, { teamId, divisionId }, context) => {
  try {
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    if (context.user.role !== 'pit-admin') {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have permission to mark teams as arrived'
      );
    }

    if (!context.user.divisions.includes(divisionId)) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have access to this division'
      );
    }

    const existing = await db.raw.sql
      .selectFrom('team_divisions')
      .select(['pk'])
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .where('arrived', '=', true as never) // TypeScript quirk workaround
      .executeTakeFirst();

    if (existing) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        `Team #${teamId} has already arrived at this division`
      );
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

    return { teamId };
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

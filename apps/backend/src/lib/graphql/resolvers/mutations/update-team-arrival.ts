import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface UpdateTeamArrivalArgs {
  teamId: string;
  divisionId: string;
  arrived: boolean;
}

interface TeamArrivalEvent {
  teamId: string;
  arrived: boolean;
}

/**
 * Resolver for Mutation.updateTeamArrival
 * Marks a team as arrived or not arrived at a division and publishes an event.
 */
export const updateTeamArrivalResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  UpdateTeamArrivalArgs,
  Promise<TeamArrivalEvent>
> = async (_root, { teamId, divisionId, arrived }, context) => {
  try {
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    if (context.user.role !== 'pit-admin') {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have permission to update team arrival status'
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
      .select(['pk', 'arrived'])
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!existing) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Team #${teamId} is not registered in this division`
      );
    }

    if (existing.arrived === arrived) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        arrived
          ? `Team #${teamId} has already arrived at this division`
          : `Team #${teamId} has not arrived at this division yet`
      );
    }

    const update: Record<string, unknown> = {
      arrived,
      arrived_at: arrived ? new Date() : null
    };
    await db.raw.sql
      .updateTable('team_divisions')
      .set(update)
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .execute();

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.TEAM_ARRIVED, { teamId, arrived });

    return { teamId, arrived };
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

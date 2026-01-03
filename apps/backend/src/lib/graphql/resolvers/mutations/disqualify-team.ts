import { GraphQLFieldResolver } from 'graphql';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

interface DisqualifyTeamArgs {
  teamId: string;
  divisionId: string;
}

interface TeamEvent {
  teamId: string;
}

/**
 * Resolver for Mutation.disqualifyTeam
 * Disqualifies a team in a division. This action is irreversible.
 * Only Judge Advisors and Lead Judges can disqualify teams in their assigned divisions.
 */
export const disqualifyTeamResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  DisqualifyTeamArgs,
  Promise<TeamEvent>
> = async (_root, { teamId, divisionId }, context) => {
  try {
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    if (context.user.role !== 'judge-advisor') {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have permission to disqualify teams'
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
      .select(['pk', 'disqualified'])
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!existing) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Team #${teamId} not found in this division`
      );
    }

    if (existing.disqualified) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        `Team #${teamId} has already been disqualified in this division`
      );
    }

    await db.raw.sql
      .updateTable('team_divisions')
      .set({ disqualified: true as never }) // TS Quirk with Kysely booleans
      .where('team_id', '=', teamId)
      .where('division_id', '=', divisionId)
      .execute();

    const pubSub = getRedisPubSub();
    await pubSub.publish(divisionId, RedisEventTypes.TEAM_DISQUALIFIED, { teamId });

    return { teamId };
  } catch (error) {
    console.error('Error disqualifying team:', teamId, 'in division:', divisionId, error);
    throw error;
  }
};

import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface AssignPersonalAwardArgs {
  awardId: string;
  winnerName: string;
  divisionId: string;
}

interface AwardEvent {
  awardId: string;
  winnerName: string;
}

/**
 * Resolver for Mutation.assignPersonalAward
 * Assigns a personal award to an individual winner (by name).
 * Only Judge Advisors can assign personal awards in their assigned divisions.
 * Personal awards can only be assigned if they have not been assigned yet.
 */
export const assignPersonalAwardResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  AssignPersonalAwardArgs,
  Promise<AwardEvent>
> = async (_root, { awardId, winnerName, divisionId }, context) => {
  try {
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    if (context.user.role !== 'judge-advisor') {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have permission to assign personal awards'
      );
    }

    if (!context.user.divisions.includes(divisionId)) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have access to this division'
      );
    }

    // Fetch the award to verify it exists, is personal type, and not already assigned
    const existing = await db.raw.sql
      .selectFrom('awards')
      .select(['pk', 'type', 'winner_name', 'winner_id'])
      .where('id', '=', awardId)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!existing) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Award #${awardId} not found in this division`
      );
    }

    if (existing.type !== 'PERSONAL') {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        `Award #${awardId} is not a personal award`
      );
    }

    if (existing.winner_name) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        `Award #${awardId} has already been assigned`
      );
    }

    // Update the award with the winner name
    await db.raw.sql
      .updateTable('awards')
      .set({ winner_name: winnerName })
      .where('id', '=', awardId)
      .where('division_id', '=', divisionId)
      .execute();

    return { awardId, winnerName };
  } catch (error) {
    console.error(
      'Error assigning personal award:',
      awardId,
      'to:',
      winnerName,
      'in division:',
      divisionId,
      error
    );
    throw error;
  }
};

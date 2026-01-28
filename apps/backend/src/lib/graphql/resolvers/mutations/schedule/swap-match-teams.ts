import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RobotGameMatchState, DivisionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

interface SwapMatchTeamsArgs {
  divisionId: string;
  matchId: string;
  participantId1: string;
  participantId2: string;
}

/**
 * Checks if a user is able to access a division for tournament management.
 * Performs the following checks:
 *
 * 1. User is authenticated.
 * 2. User has the 'tournament-manager' role.
 * 3. User is assigned to the division.
 *
 * @throws {MutationError} If any of the authorization checks fail.
 */
async function authorizeTournamentManagerAccess(
  context: GraphQLContext,
  divisionId: string
): Promise<void> {
  // Check 1: User must be authenticated
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check 2: User must have tournament-manager role
  if (context.user.role !== 'tournament-manager') {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User must have tournament-manager role');
  }

  // Check 3: User must be assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }
}

/**
 * Resolver for Mutation.swapMatchTeams
 * Swaps two teams in a specific match.
 *
 * Validation checks:
 * 1. User has tournament-manager role and access to division
 * 2. Match exists in the division
 * 3. Match is in not-started status
 * 4. Match is not currently loaded
 * 5. Both participants exist in the match
 * 6. Participants are different
 */
export const swapMatchTeamsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  SwapMatchTeamsArgs,
  Promise<{ id: string }>
> = async (_root, { divisionId, matchId, participantId1, participantId2 }, context) => {
  try {
    // Authorization
    await authorizeTournamentManagerAccess(context, divisionId);

    // Check 1: Match must exist in the division
    const match = await db.raw.sql
      .selectFrom('robot_game_matches')
      .selectAll()
      .where('id', '=', matchId)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!match) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Match ${matchId} not found in division ${divisionId}`
      );
    }

    // Check 2: Match must be in not-started status
    const matchState = await db.raw.mongo
      .collection<RobotGameMatchState>('robot_game_match_states')
      .findOne({ matchId });

    if (!matchState || matchState.status !== 'not-started') {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Match must be in not-started status to swap teams'
      );
    }

    // Check 3: Match must not be currently loaded
    const divisionState = await db.raw.mongo
      .collection<DivisionState>('division_states')
      .findOne({ divisionId });

    if (divisionState?.field?.loadedMatch === matchId) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Cannot swap teams in currently loaded match'
      );
    }

    // Check 4: Both participants must exist in the match
    const participants = await db.raw.sql
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('match_id', '=', matchId)
      .where('id', 'in', [participantId1, participantId2])
      .execute();

    if (participants.length !== 2) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        'One or both participants not found in the match'
      );
    }

    const participant1 = participants.find(p => p.id === participantId1);
    const participant2 = participants.find(p => p.id === participantId2);

    if (!participant1 || !participant2) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        'One or both participants not found in the match'
      );
    }

    // Check 5: Participants must be different
    if (participantId1 === participantId2) {
      throw new MutationError(MutationErrorCode.CONFLICT, 'Cannot swap a participant with itself');
    }

    // Perform the swap by exchanging team_id values
    await db.raw.sql.transaction().execute(async trx => {
      // Swap team IDs
      await trx
        .updateTable('robot_game_match_participants')
        .set({ team_id: participant2.team_id })
        .where('id', '=', participantId1)
        .execute();

      await trx
        .updateTable('robot_game_match_participants')
        .set({ team_id: participant1.team_id })
        .where('id', '=', participantId2)
        .execute();
    });

    return { id: matchId };
  } catch (error) {
    if (error instanceof MutationError) {
      throw error;
    }
    console.error('Error swapping match teams:', error);
    throw new MutationError(MutationErrorCode.INTERNAL_ERROR, 'Failed to swap match teams');
  }
};

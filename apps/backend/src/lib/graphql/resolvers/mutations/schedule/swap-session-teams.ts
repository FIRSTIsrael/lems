import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { JudgingSessionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

interface SwapSessionTeamsArgs {
  divisionId: string;
  sessionId1: string;
  sessionId2: string;
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
 * Resolver for Mutation.swapSessionTeams
 * Swaps two teams between judging sessions.
 *
 * Validation checks:
 * 1. User has tournament-manager role and access to division
 * 2. Both sessions exist in the division
 * 3. Sessions are different
 * 4. Both sessions are in not-started status
 * 5. Neither session is currently called/active
 */
export const swapSessionTeamsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  SwapSessionTeamsArgs,
  Promise<Array<{ id: string }>>
> = async (_root, { divisionId, sessionId1, sessionId2 }, context) => {
  try {
    // Authorization
    await authorizeTournamentManagerAccess(context, divisionId);

    // Check 1: Sessions must be different
    if (sessionId1 === sessionId2) {
      throw new MutationError(MutationErrorCode.CONFLICT, 'Cannot swap a session with itself');
    }

    // Check 2: Both sessions must exist in the division
    const sessions = await db.raw.sql
      .selectFrom('judging_sessions')
      .selectAll()
      .where('division_id', '=', divisionId)
      .where('id', 'in', [sessionId1, sessionId2])
      .execute();

    if (sessions.length !== 2) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        'One or both sessions not found in the division'
      );
    }

    const session1 = sessions.find(s => s.id === sessionId1);
    const session2 = sessions.find(s => s.id === sessionId2);

    if (!session1 || !session2) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        'One or both sessions not found in the division'
      );
    }

    // Check 3: Both sessions must be in not-started status
    const sessionStates = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .find({ sessionId: { $in: [sessionId1, sessionId2] } })
      .toArray();

    const session1State = sessionStates.find(s => s.sessionId === sessionId1);
    const session2State = sessionStates.find(s => s.sessionId === sessionId2);

    if (
      !session1State ||
      !session2State ||
      session1State.status !== 'not-started' ||
      session2State.status !== 'not-started'
    ) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Both sessions must be in not-started status to swap teams'
      );
    }

    // Check 4: Neither session should be currently called
    if (session1State.called || session2State.called) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Cannot swap teams in sessions that have been called'
      );
    }

    // Perform the swap by exchanging team_id values
    await db.raw.sql.transaction().execute(async trx => {
      // Swap team IDs
      await trx
        .updateTable('judging_sessions')
        .set({ team_id: session2.team_id })
        .where('id', '=', sessionId1)
        .execute();

      await trx
        .updateTable('judging_sessions')
        .set({ team_id: session1.team_id })
        .where('id', '=', sessionId2)
        .execute();
    });

    return [{ id: sessionId1 }, { id: sessionId2 }];
  } catch (error) {
    if (error instanceof MutationError) {
      throw error;
    }
    console.error('Error swapping session teams:', error);
    throw new MutationError(MutationErrorCode.INTERNAL_ERROR, 'Failed to swap session teams');
  }
};

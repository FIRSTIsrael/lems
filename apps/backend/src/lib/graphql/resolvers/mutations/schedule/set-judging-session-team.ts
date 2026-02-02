import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { JudgingSessionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

interface SetJudgingSessionTeamArgs {
  divisionId: string;
  sessionId: string;
  teamId: string | null;
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
 * Resolver for Mutation.setJudgingSessionTeam
 * Sets a judging session's team (can be null to unassign).
 *
 * Validation checks:
 * 1. User has tournament-manager role and access to division
 * 2. Session exists in the division
 * 3. Session is in not-started status
 * 4. Session has not been called yet
 * 5. If teamId is provided, team exists in the division
 */
export const setJudgingSessionTeamResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  SetJudgingSessionTeamArgs,
  Promise<any>
> = async (_root, { divisionId, sessionId, teamId }, context) => {
  try {
    // Authorization
    await authorizeTournamentManagerAccess(context, divisionId);

    // Check 1: Session must exist in the division
    const session = await db.raw.sql
      .selectFrom('judging_sessions')
      .selectAll()
      .where('id', '=', sessionId)
      .where('division_id', '=', divisionId)
      .executeTakeFirst();

    if (!session) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Session ${sessionId} not found in division ${divisionId}`
      );
    }

    // Check 2: Session must be in not-started status
    const sessionState = await db.raw.mongo
      .collection<JudgingSessionState>('judging_session_states')
      .findOne({ sessionId });

    if (!sessionState || sessionState.status !== 'not-started') {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Session must be in not-started status to change teams'
      );
    }

    // Check 3: Session must not have been called
    if (sessionState.called) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Cannot change teams in a session that has been called'
      );
    }

    // Check 4: If teamId is provided, team must exist in the division
    if (teamId) {
      const teams = await db.teams.byDivisionId(divisionId).getAll();
      const teamExists = teams.some(t => t.id === teamId);

      if (!teamExists) {
        throw new MutationError(
          MutationErrorCode.NOT_FOUND,
          `Team ${teamId} not found in division ${divisionId}`
        );
      }
    }

    // Update the session's team_id
    await db.raw.sql
      .updateTable('judging_sessions')
      .set({ team_id: teamId })
      .where('id', '=', sessionId)
      .execute();

    return { id: sessionId };
  } catch (error) {
    if (error instanceof MutationError) {
      throw error;
    }
    console.error('Error setting judging session team:', error);
    throw new MutationError(MutationErrorCode.INTERNAL_ERROR, 'Failed to set judging session team');
  }
};

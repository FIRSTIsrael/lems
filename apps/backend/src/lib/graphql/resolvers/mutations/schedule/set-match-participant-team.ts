import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { RobotGameMatchState, DivisionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

interface SetMatchParticipantTeamArgs {
  divisionId: string;
  matchId: string;
  participantId: string;
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
 * Resolver for Mutation.setMatchParticipantTeam
 * Sets a participant's team in a specific match (can be null to unassign).
 *
 * Validation checks:
 * 1. User has tournament-manager role and access to division
 * 2. Match exists in the division
 * 3. Match is in not-started status
 * 4. Match is not currently loaded
 * 5. Participant exists in the match
 * 6. If teamId is provided, team exists in the division
 */
export const setMatchParticipantTeamResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  SetMatchParticipantTeamArgs,
  Promise<{ id: string }>
> = async (_root, { divisionId, matchId, participantId, teamId }, context) => {
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
        'Match must be in not-started status to change teams'
      );
    }

    // Check 3: Match must not be currently loaded
    const divisionState = await db.raw.mongo
      .collection<DivisionState>('division_states')
      .findOne({ divisionId });

    if (divisionState?.field?.loadedMatch === matchId) {
      throw new MutationError(
        MutationErrorCode.CONFLICT,
        'Cannot change teams in currently loaded match'
      );
    }

    // Check 4: Participant must exist in the match
    const participant = await db.raw.sql
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('match_id', '=', matchId)
      .where('id', '=', participantId)
      .executeTakeFirst();

    if (!participant) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        'Participant not found in the match'
      );
    }

    // Check 5: If teamId is provided, team must exist in the division
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

    // Update the participant's team_id
    await db.raw.sql
      .updateTable('robot_game_match_participants')
      .set({ team_id: teamId })
      .where('id', '=', participantId)
      .execute();

    return { id: matchId };
  } catch (error) {
    if (error instanceof MutationError) {
      throw error;
    }
    console.error('Error setting match participant team:', error);
    throw new MutationError(MutationErrorCode.INTERNAL_ERROR, 'Failed to set match participant team');
  }
};

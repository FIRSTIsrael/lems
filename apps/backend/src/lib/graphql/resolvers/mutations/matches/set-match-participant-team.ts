import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

interface SetMatchParticipantTeamArgs {
  divisionId: string;
  matchId: string;
  participantId: string;
  teamId?: string | null;
}

/**
 * Resolver for Mutation.setMatchParticipantTeam
 * Sets or unsets a team for a match participant slot.
 * Used by tournament managers to assign or remove teams from match slots.
 *
 * Validation checks:
 * 1. User is authenticated and has 'tournament-manager' role
 * 2. User is assigned to the division
 * 3. Match exists and is in the division
 * 4. Participant exists in the match
 * 5. If teamId provided, team exists and is registered in the division
 */
export const setMatchParticipantTeamResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  SetMatchParticipantTeamArgs,
  Promise<unknown>
> = async (_root, { divisionId, matchId, participantId, teamId }, context) => {
  try {
    // Check 1: User must be authenticated
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // Check 2: User must have tournament-manager role
    if (context.user.role !== 'tournament-manager') {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User must have tournament-manager role'
      );
    }

    // Check 3: User must be assigned to the division
    if (!context.user.divisions.includes(divisionId)) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
    }

    // Check 4: Match must exist in the division
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

    // Check 5: Participant must exist in the match
    const participant = await db.raw.sql
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('id', '=', participantId)
      .where('match_id', '=', matchId)
      .executeTakeFirst();

    if (!participant) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        `Participant ${participantId} not found in match ${matchId}`
      );
    }

    // Check 6: If teamId provided, verify team exists
    if (teamId) {
      const team = await db.raw.sql
        .selectFrom('teams')
        .select('id')
        .where('id', '=', teamId)
        .executeTakeFirst();

      if (!team) {
        throw new MutationError(MutationErrorCode.NOT_FOUND, `Team ${teamId} not found`);
      }
    }

    // Update the participant's team assignment
    await db.raw.sql
      .updateTable('robot_game_match_participants')
      .set({ team_id: teamId || null })
      .where('id', '=', participantId)
      .execute();

    // Fetch and return the updated match with all participants
    const updatedMatch = await db.raw.sql
      .selectFrom('robot_game_matches')
      .selectAll()
      .where('id', '=', matchId)
      .executeTakeFirst();

    const participants = await db.raw.sql
      .selectFrom('robot_game_match_participants')
      .selectAll()
      .where('match_id', '=', matchId)
      .execute();

    return {
      ...updatedMatch,
      participants
    };
  } catch (error) {
    console.error(
      'Error setting match participant team for participant:',
      participantId,
      'in match:',
      matchId,
      'in division:',
      divisionId,
      error
    );
    throw error;
  }
};

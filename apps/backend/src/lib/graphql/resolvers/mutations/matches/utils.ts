import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { RobotGameMatch } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

/**
 * Checks if a user is able to access a match.
 * Performs the following checks:
 *
 * 1. User is authenticated.
 * 2. User has the 'scorekeeper' role.
 * 3. User is assigned to the division of the match.
 * 4. The match exists within the specified division.
 *
 * @throws {MutationError} If any of the authorization checks fail.
 */
export async function authorizeMatchAccess(
  context: GraphQLContext,
  divisionId: string,
  matchId: string
): Promise<RobotGameMatch> {
  // Check 1: User must be authenticated
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check 2: User must have scorekeeper role
  if (context.user.role !== 'scorekeeper') {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User must have scorekeeper role');
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

  return match;
}

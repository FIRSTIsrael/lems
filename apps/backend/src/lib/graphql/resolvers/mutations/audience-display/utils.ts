import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { DivisionState } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

/**
 * Checks if a user is able to access a match.
 * Performs the following checks:
 *
 * 1. User is authenticated.
 * 2. User has the 'scorekeeper' role.
 * 3. User is assigned to the division of the match.
 * 4. The division has division state.
 *
 * @throws {MutationError} If any of the authorization checks fail.
 */
export const authorizeAudienceDisplayAccess = async (
  context: GraphQLContext,
  divisionId: string
): Promise<DivisionState> => {
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

  // Check 4: Division must have division state
  const divisionState = await db.raw.mongo
    .collection<DivisionState>('division_states')
    .findOne({ divisionId });

  if (!divisionState) {
    throw new MutationError(
      MutationErrorCode.NOT_FOUND,
      `Division state not found for division ${divisionId}`
    );
  }

  return divisionState;
};

import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { JudgingSession } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

/**
 * Helper function to check session authorization
 */
export async function authorizeSessionAccess(
  context: GraphQLContext,
  divisionId: string,
  sessionId: string
): Promise<{ session: JudgingSession }> {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check 1: User must be a judge
  if (context.user.role !== 'judge') {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User must have judge  role');
  }

  // Check 2: User must be assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Check 3: Session exists in the division
  const session = await db.raw.sql
    .selectFrom('judging_sessions')
    .selectAll('judging_sessions')
    .where('judging_sessions.id', '=', sessionId)
    .where('judging_sessions.division_id', '=', divisionId)
    .executeTakeFirst();

  if (!session) {
    throw new MutationError(
      MutationErrorCode.NOT_FOUND,
      `Session ${sessionId} not found in division ${divisionId}`
    );
  }

  // Check 4: User must be in the same room as the session
  const userRoomId = context.user.roleInfo?.roomId;
  if (!userRoomId) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User does not have an assigned room');
  }

  if (session.room_id !== userRoomId) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Session room does not match user assigned room'
    );
  }

  return { session };
}

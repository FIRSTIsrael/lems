import { ObjectId } from 'mongodb';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

/**
 * Helper function to check rubric authorization
 * Validates user authentication, role, division assignment, and rubric ownership
 * For judges: Verifies the team is in a session assigned to their room
 * For judge-advisors/lead-judges: Allows all division assignments
 */
export async function authorizeRubricAccess(
  context: GraphQLContext,
  divisionId: string,
  rubricId: string
): Promise<{ rubric: Record<string, unknown>; rubricObjectId: ObjectId }> {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check 1: User must be a judge or judge-advisor
  const allowedRoles = new Set(['judge', 'judge-advisor', 'lead-judge']);
  const isAuthorized = allowedRoles.has(context.user.role);

  if (!isAuthorized) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have judge, lead-judge or judge-advisor role'
    );
  }

  // Check 2: User must be assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Check 3: Parse and fetch the rubric
  let rubricObjectId: ObjectId;
  try {
    rubricObjectId = new ObjectId(rubricId);
  } catch {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      `Invalid rubric ID format: ${rubricId}`
    );
  }

  const rubric = await db.raw.mongo
    .collection<{ _id?: ObjectId; divisionId: string; status: string; teamId?: string }>('rubrics')
    .findOne({ _id: rubricObjectId });

  if (!rubric) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Rubric ${rubricId} not found`);
  }

  // Check 4: Verify rubric belongs to the specified division
  if (rubric.divisionId !== divisionId) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Rubric does not belong to the specified division'
    );
  }

  // Check 5: For judges only - verify team is in a session in their room
  if (context.user.role === 'judge') {
    const userRoomId = (context.user.roleInfo as Record<string, string> | null)?.roomId;
    if (!userRoomId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'Judge must have a room assignment in their roleInfo'
      );
    }

    const teamId = (rubric.teamId as string | undefined) || '';
    if (!teamId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'Rubric does not have a team assignment'
      );
    }

    // Find if the team has a session in the judge's room
    const session = await db.judgingSessions.byDivision(divisionId).getByTeam(teamId);

    if (!session || session.room_id !== userRoomId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'Team is not assigned to a session in your room'
      );
    }
  }

  return { rubric, rubricObjectId };
}

/**
 * Helper function to check if rubric is editable
 * Judges and judge-advisors can edit draft rubrics
 * Lead-judges can also edit locked rubrics
 * No one can edit approved rubrics
 */
export function assertRubricEditable(status: string, userRole?: string): void {
  if (status === 'approved') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot update rubric with status "${status}"`
    );
  }

  if (status === 'locked' && userRole === 'judge') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Judges cannot update rubric with status "${status}"`
    );
  }
}

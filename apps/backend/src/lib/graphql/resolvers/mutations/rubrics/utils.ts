import { ObjectId } from 'mongodb';
import { JudgingCategory, Rubric } from '@lems/database';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { rubrics } from '@lems/shared/rubrics';
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

  const rubric = await db.raw.mongo.collection<Rubric>('rubrics').findOne({ _id: rubricObjectId });

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

  // Check 5: Verify that the team session has been completed
  const teamId = (rubric.teamId as string | undefined) || '';
  if (!teamId) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'Rubric does not have a team assignment');
  }

  const session = await db.judgingSessions.byDivision(divisionId).getByTeam(teamId);

  if (!session) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Team does not have a judging session in this division'
    );
  }

  const sessionState = await db.judgingSessions.byId(session.id).state().get();

  if (sessionState?.status !== 'completed') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Cannot access rubric before the team session is completed'
    );
  }

  // Check 6: For judges only - verify team is in a session in their room
  if (context.user.role === 'judge') {
    const userRoomId = (context.user.roleInfo as Record<string, string> | null)?.roomId;
    if (!userRoomId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'Judge must have a room assignment in their roleInfo'
      );
    }

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

/**
 * Determines the appropriate status for a rubric based on its content.
 *
 * Rules:
 * - 'completed': All fields have non-null values, fields with value 4 have notes, and if feedback is required, both feedback fields are non-empty
 * - 'draft': Partially filled or missing completion criteria
 * - 'empty': No data filled in
 *
 * @param rubricData - The rubric's data object
 * @param rubricCategory - The category key (e.g., 'innovation-project')
 * @returns The determined status ('empty', 'draft', or 'completed')
 */
export function determineRubricCompletionStatus(
  rubricData: Record<string, unknown>,
  rubricCategory: JudgingCategory
): 'empty' | 'draft' | 'completed' {
  if (!rubricData || typeof rubricData !== 'object') {
    return 'empty';
  }

  const schema = rubrics[rubricCategory as keyof typeof rubrics];
  if (!schema || typeof schema === 'string') {
    return 'empty';
  }

  const fields = rubricData.fields as
    | Record<string, { value: number | null; notes?: string }>
    | undefined;
  const feedback = rubricData.feedback as { greatJob?: string; thinkAbout?: string } | undefined;

  let hasAnyValue = false;
  if (fields) {
    for (const section of schema.sections) {
      for (const field of section.fields) {
        const fieldValue = fields[field.id];
        if (fieldValue?.value !== null && fieldValue?.value !== undefined) {
          hasAnyValue = true;
          break;
        }
      }
      if (hasAnyValue) break;
    }
  }

  if (schema.feedback && feedback) {
    if (feedback.greatJob?.trim() || feedback.thinkAbout?.trim()) {
      hasAnyValue = true;
    }
  }

  if (!hasAnyValue) {
    return 'empty';
  }

  const isComplete = isRubricComplete(rubricData, rubricCategory);

  return isComplete ? 'completed' : 'draft';
}

/**
 * Validates whether a rubric meets all completion criteria.
 *
 * Completion requires:
 * 1. All fields have non-null values (1-4)
 * 2. Fields with value 4 have non-empty notes
 * 3. If feedback is required by the schema, both feedback fields are non-empty
 *
 * @param rubricData - The rubric's data object
 * @param rubricCategory - The category key (e.g., 'innovation-project')
 * @returns true if all criteria are met, false otherwise
 */
export function isRubricComplete(
  rubricData: Record<string, unknown> | undefined,
  rubricCategory: string
): boolean {
  if (!rubricData || typeof rubricData !== 'object') {
    return false;
  }

  const schema = rubrics[rubricCategory as keyof typeof rubrics];
  if (!schema || typeof schema === 'string') {
    return false;
  }

  const fields = rubricData.fields as
    | Record<string, { value: number | null; notes?: string }>
    | undefined;
  const feedback = rubricData.feedback as { greatJob?: string; thinkAbout?: string } | undefined;

  // Criterion 1: All fields must have non-null values
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const fieldValue = fields?.[field.id];
      if (fieldValue?.value === null || fieldValue?.value === undefined) {
        return false;
      }
      // Also validate value is in range 1-4
      if (!Number.isInteger(fieldValue?.value) || fieldValue?.value < 1 || fieldValue?.value > 4) {
        return false;
      }
    }
  }

  // Criterion 2: Fields with value 4 must have notes
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const fieldValue = fields?.[field.id];
      if (fieldValue?.value === 4 && (!fieldValue.notes || fieldValue.notes.trim() === '')) {
        return false;
      }
    }
  }

  // Criterion 3: If feedback is required, both fields must be non-empty
  if (schema.feedback) {
    if (!feedback?.greatJob?.trim() || !feedback?.thinkAbout?.trim()) {
      return false;
    }
  }

  return true;
}

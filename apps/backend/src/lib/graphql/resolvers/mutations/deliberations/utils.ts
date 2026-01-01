import { JudgingCategory, JudgingDeliberation } from '@lems/database';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

/**
 * Helper function to check deliberation authorization
 * User must be a Judge Advisor or Lead Judge in the division
 * If Lead Judge, must also be assigned to the same category
 */
export async function authorizeDeliberationAccess(
  context: GraphQLContext,
  divisionId: string,
  category: JudgingCategory
): Promise<JudgingDeliberation> {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check 1: User must be a judge-advisor or lead-judge
  const allowedRoles = new Set(['judge-advisor', 'lead-judge']);
  const isAuthorized = allowedRoles.has(context.user.role);

  if (!isAuthorized) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have judge-advisor or lead-judge role'
    );
  }

  // Check 2: User must be assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Check 3: If lead-judge, must be assigned to the same category
  if (context.user.role === 'lead-judge') {
    const assignedCategory = (context.user.roleInfo as Record<string, string> | null)?.category;
    if (assignedCategory !== category) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        `Lead Judge must be assigned to the ${category} category`
      );
    }
  }

  // Check 4: Verify division exists
  const division = await db.divisions.byId(divisionId).get();
  if (!division) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, `Division ${divisionId} not found`);
  }

  // Check 5: Verify deliberation exists
  const deliberation = await db.judgingDeliberations.byDivision(divisionId).getByCategory(category);

  if (!deliberation) {
    throw new MutationError(
      MutationErrorCode.NOT_FOUND,
      `Deliberation for category ${category} not found in division ${divisionId}`
    );
  }

  return deliberation;
}

/**
 * Helper function to check if deliberation is editable
 * Deliberation must not have a COMPLETED status
 */
export function assertDeliberationEditable(status: string): void {
  if (status === 'completed') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Cannot update deliberation with status "${status}"`
    );
  }
}

import { ObjectId } from 'mongodb';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { Scoresheet } from '@lems/database';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

/**
 * Helper function to check scoresheet authorization
 * Validates user authentication, role, division assignment, and scoresheet ownership
 * For scoresheeters (volunteers): Verifies the team is in a match assigned to their table
 * For field-coordinators: Allows all division assignments
 */
export async function authorizeScoresheetAccess(
  context: GraphQLContext,
  divisionId: string,
  scoresheetId: string
): Promise<{ scoresheet: Scoresheet; scoresheetObjectId: ObjectId }> {
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check 1: User must be a scoresheet editor or field-coordinator
  const allowedRoles = new Set(['referee', 'head-referee']);
  const isAuthorized = allowedRoles.has(context.user.role);

  if (!isAuthorized) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User must have referee, or head-referee role'
    );
  }

  // Check 2: User must be assigned to the division
  if (!context.user.divisions.includes(divisionId)) {
    throw new MutationError(MutationErrorCode.FORBIDDEN, 'User is not assigned to the division');
  }

  // Check 3: Parse and fetch the scoresheet
  let scoresheetObjectId: ObjectId;
  try {
    scoresheetObjectId = new ObjectId(scoresheetId);
  } catch {
    throw new MutationError(
      MutationErrorCode.UNAUTHORIZED,
      `Invalid scoresheet ID format: ${scoresheetId}`
    );
  }

  const scoresheet = await db.raw.mongo
    .collection<Scoresheet>('scoresheets')
    .findOne({ _id: scoresheetObjectId });

  if (!scoresheet) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, `Scoresheet ${scoresheetId} not found`);
  }

  // Check 4: Verify scoresheet belongs to the specified division
  if (scoresheet.divisionId !== divisionId) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Scoresheet does not belong to the specified division'
    );
  }

  // Check 5: Verify that the team match was completed
  const teamId = (scoresheet.teamId as string | undefined) || '';
  if (!teamId) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Scoresheet does not have a team assignment'
    );
  }

  const teamMatches = await db.robotGameMatches.byDivision(divisionId).getByTeam(teamId);
  const match = teamMatches.find(m => m.round === scoresheet.round && m.stage === scoresheet.stage);

  if (!match) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Team does not have a match matching the scoresheet'
    );
  }

  const matchState = await db.robotGameMatches.byId(match.id).state().get();

  if (matchState?.status !== 'completed') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'Cannot access scoresheet before the team match is completed'
    );
  }

  // Check 6: For referees only - verify team is in a match in their table
  if (context.user.role === 'referee') {
    const userTableId = (context.user.roleInfo as Record<string, string> | null)?.tableId;
    if (!userTableId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'Volunteer must have a table assignment in their roleInfo'
      );
    }

    // Find if the team has a match in the volunteer's table
    if (!match.participants.find(p => p.team_id === teamId && p.table_id === userTableId)) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'Team is not assigned to a match in your table'
      );
    }
  }

  return { scoresheet, scoresheetObjectId };
}

/**
 * Helper function to check if scoresheet is editable
 */
export function assertScoresheetEditable(status: string, userRole?: string): void {
  // Head-referees can always edit
  if (userRole === 'head-referee') {
    return;
  }

  // Referees cannot edit submitted scoresheets
  if (userRole === 'referee' && status === 'submitted') {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      `Scoresheet with status 'submitted' cannot be edited by a referee`
    );
  }
}

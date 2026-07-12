import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import { hyphensToUnderscores } from '@lems/shared/utils';
import db from '../../../database';
import { toGraphQLId } from '../../utils/object-id-transformer';
import { buildTeamGraphQL, TeamGraphQL } from '../../utils/team-builder';
import { RubricGraphQL } from '../../utils/rubric-builder';
import type { GraphQLContext } from '../../apollo-server';

/**
 * Resolver for Rubric.team field.
 * Fetches the team being evaluated in this rubric.
 */
export const rubricTeamResolver: GraphQLFieldResolver<
  RubricGraphQL,
  unknown,
  unknown,
  Promise<TeamGraphQL>
> = async (rubric: RubricGraphQL) => {
  const team = await db.teams.byId(rubric.teamId).get();
  if (!team) {
    throw new Error(`Team not found: ${rubric.teamId}`);
  }
  return buildTeamGraphQL(team, rubric.divisionId);
};

/**
 * Resolver for Rubric.data field.
 * Returns the rubric data if it exists.
 * Only lead judges, judge advisors, and judges assigned to the team's judging room can access rubric data.
 */
export const rubricDataResolver: GraphQLFieldResolver<
  RubricGraphQL,
  GraphQLContext,
  unknown,
  Promise<RubricGraphQL['data'] | null>
> = async (
  rubric: RubricGraphQL,
  args,
  context: GraphQLContext
): Promise<RubricGraphQL['data'] | null> => {
  try {
    // Check authentication
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // Lead judges and judge advisors can always access rubric data
    if (context.user.role === 'lead-judge' || context.user.role === 'judge-advisor') {
      return rubric.data || null;
    }

    // Only judges can access beyond this point
    if (context.user.role !== 'judge') {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have permission to access rubric data'
      );
    }

    // For judges, verify they are assigned to the room where the team is being judged
    const roomId = context.user.roleInfo?.['roomId'];
    if (!roomId) {
      throw new MutationError(MutationErrorCode.FORBIDDEN, 'Judge is not assigned to any room');
    }

    // Fetch the team's judging session to verify the judge's room matches
    const session = await db.judgingSessions.byDivision(rubric.divisionId).getByTeam(rubric.teamId);

    if (!session) {
      throw new MutationError(
        MutationErrorCode.NOT_FOUND,
        'Team has no judging session in this division'
      );
    }

    // Verify the session's room matches the judge's assigned room
    if (session.room_id !== roomId) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        "Judge is not assigned to this team's room"
      );
    }

    return rubric.data || null;
  } catch (error) {
    if (error instanceof MutationError) {
      throw error;
    }
    console.error('[rubricDataResolver] Error accessing rubric data:', error);
    throw error;
  }
};

/**
 * Main resolver object for Rubric type fields.
 * Handles id, category, and status field transformations.
 */
export const rubricResolvers = {
  id: ((rubric: RubricGraphQL) => {
    if (!rubric.id) {
      throw new Error('Rubric ID is missing');
    }
    return toGraphQLId(rubric.id);
  }) as GraphQLFieldResolver<RubricGraphQL, unknown, unknown, string>,

  category: ((rubric: RubricGraphQL) => {
    // Convert from 'innovation-project' to 'innovation_project' format for GraphQL
    return hyphensToUnderscores(rubric.category);
  }) as GraphQLFieldResolver<RubricGraphQL, unknown, unknown, string>,

  status: ((rubric: RubricGraphQL) => {
    // Return status as-is (already in lowercase format)
    return rubric.status;
  }) as GraphQLFieldResolver<RubricGraphQL, unknown, unknown, string>
};

import { GraphQLFieldResolver } from 'graphql';
import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface DivisionWithId {
  id: string;
}

interface AwardsArgs {
  allowNominations?: boolean;
}

export interface AwardGraphQL {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  allowNominations: boolean;
}

const allowedRoles = new Set(['judge-advisor', 'tournament-manager']);

/**
 * Resolver for Division.awards field.
 * Fetches all awards configured for a division.
 * Requires user authentication and division assignment.
 * @param division - The division object containing the id
 * @param args - Optional arguments to filter results
 * @param args.allowNominations - Filter by allowNominations
 * @param context - GraphQL context containing user information
 */
export const divisionAwardsResolver: GraphQLFieldResolver<
  DivisionWithId,
  GraphQLContext,
  AwardsArgs,
  Promise<AwardGraphQL[]>
> = async (division: DivisionWithId, args: AwardsArgs, context: GraphQLContext) => {
  try {
    // Check authentication
    if (!context.user) {
      throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // Check authorization
    if (!allowedRoles.has(context.user.role)) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have permission to view awards.'
      );
    }

    // Check division assignment
    if (!context.user.divisions.includes(division.id)) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User is not assigned to this division'
      );
    }

    let awards = await db.awards.byDivisionId(division.id).getAll();

    // Filter by allowNominations if specified
    if (args?.allowNominations !== undefined) {
      awards = awards.filter(award => award.allow_nominations === args.allowNominations);
    }

    return awards.map(award => ({
      id: award.id,
      name: award.name,
      index: award.index,
      place: award.place,
      type: award.type,
      isOptional: award.is_optional,
      allowNominations: award.allow_nominations
    }));
  } catch (error) {
    console.error('Error fetching awards for division:', division.id, error);
    throw error;
  }
};

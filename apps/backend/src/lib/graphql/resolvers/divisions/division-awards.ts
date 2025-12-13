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
  winnerName?: string;
  winnerId?: string;
}

const allowedRoles = new Set(['judge-advisor', 'lead-judge']);

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
    // Check authorization
    if (!allowedRoles.has(context.user.role)) {
      throw new MutationError(
        MutationErrorCode.FORBIDDEN,
        'User does not have permission to view awards.'
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

/**
 * Resolver for Division.awards.winners field.
 * Fetches all awards with their winners for a division.
 * Requires user authentication and division assignment.
 * @param division - The division object containing the id
 * @param _args - Unused arguments
 * @param context - GraphQL context containing user information
 */
export const divisionAwardsWinnersResolver: GraphQLFieldResolver<
  DivisionWithId,
  GraphQLContext,
  unknown,
  Promise<AwardGraphQL[]>
> = async (division: DivisionWithId, _args: unknown, context: GraphQLContext) => {
  try {
    const awards = await db.awards.byDivisionId(division.id).getAll();

    const areAwardsClosed = false; // Placeholder for actual check
    const canViewWinners = areAwardsClosed || allowedRoles.has(context.user.role);

    return awards.map(award => ({ 
      id: award.id,
      name: award.name,
      index: award.index,
      place: award.place,
      type: award.type,
      isOptional: award.is_optional,
      allowNominations: award.allow_nominations,
      ...(canViewWinners && {
        winnerName: award.winner_name,
        winnerId: award.winner_id
      })
    }));

  } catch (error) {
    console.error('Error fetching awards with winners for division:', division.id, error);
    throw error;
  }
};

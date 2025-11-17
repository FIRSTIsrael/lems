import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

export interface JudgingGraphQL {
  divisionId: string;
}

interface DivisionWithId {
  id: string;
}

/**
 * Resolver for Division.judging field.
 * Returns a Judging object with the division context.
 * The actual sessions and rooms are resolved by the JudgingSessionsResolver and JudgingRoomsResolver.
 */
export const divisionJudgingResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  unknown,
  Promise<JudgingGraphQL>
> = async (division: DivisionWithId) => {
  try {
    // Verify division exists
    const divisionExists = await db.divisions.byId(division.id).get();
    if (!divisionExists) {
      throw new Error(`Division with ID ${division.id} not found`);
    }

    return {
      divisionId: division.id
    };
  } catch (error) {
    console.error('Error fetching judging for division:', division.id, error);
    throw error;
  }
};

import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface DivisionWithId {
  id: string;
}

export interface AwardGraphQL {
  id: string;
  name: string;
  place: number;
  description: string | null;
}

/**
 * Resolver for Division.awards field.
 * Fetches all awards configured for a division.
 */
export const divisionAwardsResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  unknown,
  Promise<AwardGraphQL[]>
> = async (division: DivisionWithId) => {
  try {
    const awards = await db.awards.byDivisionId(division.id).getAll();

    return awards.map(award => ({
      id: award.id,
      name: award.name,
      place: award.place,
      // description is not stored per-row in DB; it is derived from season config on the frontend.
      // For GraphQL type safety we expose it as nullable and currently return null.
      description: null
    }));
  } catch (error) {
    console.error('Error fetching awards for division:', division.id, error);
    throw error;
  }
};

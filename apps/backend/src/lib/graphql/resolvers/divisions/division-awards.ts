import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface DivisionWithId {
  id: string;
}

export interface AwardGraphQL {
  id: string;
  name: string;
  placeCount: number;
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

    const awardGroups = awards.reduce((groups, award) => {
      if (!groups[award.name]) {
        groups[award.name] = {
          id: award.id, 
          name: award.name,
          placeCount: 0,
          description: null
        };
      }
      groups[award.name].placeCount++;
      return groups;
    }, {} as Record<string, AwardGraphQL>);

    return Object.values(awardGroups);
  } catch (error) {
    console.error('Error fetching awards for division:', division.id, error);
    throw error;
  }
};
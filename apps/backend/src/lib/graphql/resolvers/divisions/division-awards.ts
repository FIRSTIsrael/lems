import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface DivisionWithId {
  id: string;
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

import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface DivisionWithId {
  id: string;
}

interface AwardsArgs {
  allowNominations?: boolean;
}

export interface AwardGraphQL {
  id: string;
  divisionId: string; // Added for award winner resolver
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  allowNominations: boolean;
  automaticAssignment: boolean;
  description?: string; // Added description field
}

/**
 * Resolver for Division.awards field.
 * Fetches all awards configured for a division.
 * @param division - The division object containing the id
 * @param args - Optional arguments to filter results
 * @param args.allowNominations - Filter by allowNominations
 */
export const divisionAwardsResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  AwardsArgs,
  Promise<AwardGraphQL[]>
> = async (division: DivisionWithId, args: AwardsArgs) => {
  try {
    let awards = await db.awards.byDivisionId(division.id).getAll();

    // Filter by allowNominations if specified
    if (args?.allowNominations !== undefined) {
      awards = awards.filter(award => award.allow_nominations === args.allowNominations);
    }

    return awards.map(award => ({
      id: award.id,
      divisionId: division.id,
      name: award.name,
      index: award.index,
      place: award.place,
      type: award.type,
      isOptional: award.is_optional,
      allowNominations: award.allow_nominations,
      automaticAssignment: award.automatic_assignment,
      description: award.description
    }));
  } catch (error) {
    console.error('Error fetching awards for division:', division.id, error);
    throw error;
  }
};

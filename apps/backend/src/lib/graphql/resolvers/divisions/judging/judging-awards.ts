import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface JudgingWithDivisionId {
  divisionId: string;
}

interface AwardGraphQL {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  allowNominations: boolean;
  automaticAssignment: boolean;
  winner_id?: string;
  winner_name?: string;
  divisionId: string;
  showPlaces: boolean;
}

interface AwardsArgs {
  allowNominations?: boolean;
}

/**
 * Resolver for Judging.awards field.
 * Fetches all available awards for a division.
 *
 * @param division - The division object containing the id
 * @param args - Optional arguments to filter results
 * @param args.allowNominations - Filter by allowNominations
 */
export const judgingAwardsResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  AwardsArgs,
  Promise<AwardGraphQL[]>
> = async (judging: JudgingWithDivisionId, args: AwardsArgs) => {
  try {
    let awards = await db.awards.byDivisionId(judging.divisionId).getAll();

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
      showPlaces: award.show_places,
      isOptional: award.is_optional,
      allowNominations: award.allow_nominations,
      automaticAssignment: award.automatic_assignment,
      divisionId: judging.divisionId
    }));
  } catch (error) {
    console.error('Error fetching judging rooms for division:', judging.divisionId, error);
    throw error;
  }
};

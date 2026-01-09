import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { TeamGraphQL } from '../../../utils/team-builder';

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
  winner?: TeamWinner | PersonalWinner;
}

interface TeamWinner {
  team: TeamGraphQL;
}

interface PersonalWinner {
  name: string;
}

interface AwardsArgs {
  allowNominations?: boolean;
}

/**
 * Resolver for Judging.awards field.
 * Fetches all available awards with winners for a division.
 * 
 * @param division - The division object containing the id
 * @param args - Optional arguments to filter results
 * @param args.allowNominations - Filter by allowNominations
 */
export const judgingAwardWinnersResolver: GraphQLFieldResolver<
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

    const teams = await db.teams.byDivisionId(judging.divisionId).getAll();

    return awards.map(award => {
      const teamWinner = teams.find(team => team.id === award.winner_id);
      return {
        id: award.id,
        name: award.name,
        index: award.index,
        place: award.place,
        type: award.type,
        isOptional: award.is_optional,
        allowNominations: award.allow_nominations,
        automaticAssignment: award.automatic_assignment,
        winner: award.type === 'TEAM' ? teamWinner : { name: award.winner_name }
      };
    });
  } catch (error) {
    console.error('Error fetching judging rooms for division:', judging.divisionId, error);
    throw error;
  }
};

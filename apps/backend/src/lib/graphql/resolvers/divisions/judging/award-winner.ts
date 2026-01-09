import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { TeamGraphQL, buildTeamGraphQL } from '../../../utils/team-builder';

interface AwardWithDivisionId {
  id: string;
  divisionId: string;
}

interface PersonalWinnerData {
  __typename: 'PersonalWinner';
  name: string;
}

interface TeamWinnerData {
  __typename: 'TeamWinner';
  team: TeamGraphQL;
}

type AwardWinner = PersonalWinnerData | TeamWinnerData | null;

/**
 * Resolver for Award.winner field.
 * Fetches the winner of an award, which can be either a team or a personal winner.
 * This is a computed resolver that can be extended with permissions later.
 *
 * @param award - The award object containing winner information
 * @param args - Resolver arguments
 * @param context - GraphQL context
 * @returns The award winner (team or person), or null if not set
 */
export const awardWinnerResolver: GraphQLFieldResolver<
  AwardWithDivisionId,
  unknown,
  unknown,
  Promise<AwardWinner>
> = async (award: AwardWithDivisionId): Promise<AwardWinner> => {
  try {
    const awardRecord = (await db.awards.byDivisionId(award.divisionId).getAll()).find(a => a.id === award.id);
    if (!awardRecord) {
      return null;
    }

    // For team awards, fetch the team
    if (awardRecord.type === 'TEAM' && awardRecord.winner_id) {
      const team = await db.teams.byId(awardRecord.winner_id).get();
      if (team) {
        const result: TeamWinnerData = {
          __typename: 'TeamWinner',
          team: buildTeamGraphQL(team, award.divisionId)
        };
        return result;
      }
    }

    // For personal awards, return the name
    if (awardRecord.type === 'PERSONAL' && awardRecord.winner_name) {
      const result: PersonalWinnerData = {
        __typename: 'PersonalWinner',
        name: awardRecord.winner_name
      };
      return result;
    }

    return null;
  } catch (error) {
    console.error('[awardWinnerResolver] Error fetching award winner:', error);
    throw error;
  }
};

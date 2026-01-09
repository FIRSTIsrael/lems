import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { TeamGraphQL, buildTeamGraphQL } from '../../../utils/team-builder';

interface AwardWithDivisionId {
  id: string;
  type: 'PERSONAL' | 'TEAM';
  winner_id?: string;
  winner_name?: string;
  divisionId?: string;
}

type AwardWinner = { team: TeamGraphQL } | { name: string } | null;

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
> = async (award: AwardWithDivisionId) => {
  try {
    // If no winner is set, return null
    if (!award.winner_id && !award.winner_name) {
      return null;
    }

    // For team awards, fetch the team
    if (award.type === 'TEAM' && award.winner_id && award.divisionId) {
      const team = await db.teams.byId(award.winner_id).get();
      if (team) {
        return {
          team: buildTeamGraphQL(team, award.divisionId)
        };
      }
    }

    // For personal awards, return the name
    if (award.type === 'PERSONAL' && award.winner_name) {
      return {
        name: award.winner_name
      };
    }

    return null;
  } catch (error) {
    console.error('[awardWinnerResolver] Error fetching award winner:', error);
    throw error;
  }
};

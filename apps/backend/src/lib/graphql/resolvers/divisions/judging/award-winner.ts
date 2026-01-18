import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { TeamGraphQL, buildTeamGraphQL } from '../../../utils/team-builder';
import { GraphQLContext } from '../../../apollo-server';

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
 *
 * @param award - The award object containing winner information
 * @param args - Resolver arguments
 * @param context - GraphQL context containing user information
 * @returns The award winner (team or person), or null if not set or not authorized
 */
export const awardWinnerResolver: GraphQLFieldResolver<
  AwardWithDivisionId,
  GraphQLContext,
  unknown,
  Promise<AwardWinner>
> = async (award: AwardWithDivisionId, args, context: GraphQLContext): Promise<AwardWinner> => {
  try {
    // Check if awards have been assigned in this division
    const division = await db.divisions.byId(award.divisionId).get();
    if (!division) {
      return null;
    }

    if (!division.awards_assigned) {
      const isJudgeAdvisor = context.user?.role === 'judge-advisor';
      if (!isJudgeAdvisor) {
        return null;
      }
    } else {
      const isPresentor = ['mc', 'judge-advisor', 'scorekeeper', 'audience-display'].includes(
        context.user?.role || ''
      );
      if (!isPresentor) {
        return null; // No permission
      }
    }

    const awardRecord = (await db.awards.byDivisionId(award.divisionId).getAll()).find(
      a => a.id === award.id
    );
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

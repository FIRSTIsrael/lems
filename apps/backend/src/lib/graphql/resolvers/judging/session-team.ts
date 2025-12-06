import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';
import { buildTeamGraphQL, TeamGraphQL } from '../../utils/team-builder';

interface JudgingSessionWithTeamAndDivisionId {
  teamId: string | null;
  divisionId: string;
}

/**
 * Resolver for JudgingSession.team field.
 * Fetches the team information for a judging session.
 * Returns null if the team ID is null (unoccupied session).
 * Only executes if the team field is requested.
 *
 * Includes divisionId context so child resolvers (like arrived) can access it.
 */
export const judgingSessionTeamResolver: GraphQLFieldResolver<
  JudgingSessionWithTeamAndDivisionId,
  unknown,
  unknown,
  Promise<TeamGraphQL | null>
> = async (session: JudgingSessionWithTeamAndDivisionId) => {
  try {
    if (!session.teamId) {
      return null;
    }

    const team = await db.teams.byId(session.teamId).get();
    if (!team) {
      throw new Error(`Team with ID ${session.teamId} not found`);
    }

    return buildTeamGraphQL(team, session.divisionId);
  } catch (error) {
    console.error('Error fetching team for judging session:', session.teamId, error);
    throw error;
  }
};

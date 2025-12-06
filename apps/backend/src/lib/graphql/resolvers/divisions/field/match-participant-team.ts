import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { buildTeamGraphQL, TeamGraphQL } from '../../../utils/team-builder';

interface TeamAndDivisionId {
  teamId: string | null;
  divisionId: string;
}

/**
 * Resolver for MatchParticipant.team field.
 * Fetches the team for a match participant, returns null if no team is assigned.
 * Only executed when the team field is explicitly requested.
 * Includes divisionId context so the team can be properly built with division scope.
 */
export const matchParticipantTeamResolver: GraphQLFieldResolver<
  TeamAndDivisionId,
  unknown,
  unknown,
  Promise<TeamGraphQL | null>
> = async (participant: TeamAndDivisionId) => {
  if (!participant.teamId) {
    return null;
  }

  try {
    const team = await db.teams.byId(participant.teamId).get();
    if (!team) {
      return null;
    }

    return buildTeamGraphQL(team, participant.divisionId);
  } catch (error) {
    console.error('Error fetching team for participant:', participant.teamId, error);
    throw error;
  }
};

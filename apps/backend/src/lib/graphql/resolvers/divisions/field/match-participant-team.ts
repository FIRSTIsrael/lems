import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { MatchParticipantGraphQL } from './match-participants';

/**
 * Resolver for MatchParticipant.team field.
 * Fetches the team for a match participant, returns null if no team is assigned.
 * Only executed when the team field is explicitly requested.
 */
export const matchParticipantTeamResolver: GraphQLFieldResolver<
  MatchParticipantGraphQL,
  unknown,
  unknown,
  Promise<{ id: string; name: string; number: number } | null>
> = async (participant: MatchParticipantGraphQL) => {
  if (!participant.teamId) {
    return null;
  }

  try {
    const team = await db.teams.byId(participant.teamId).get();
    if (!team) {
      return null;
    }

    return {
      id: team.id,
      name: team.name,
      number: team.number
    };
  } catch (error) {
    console.error('Error fetching team for participant:', participant.tableId, error);
    throw error;
  }
};

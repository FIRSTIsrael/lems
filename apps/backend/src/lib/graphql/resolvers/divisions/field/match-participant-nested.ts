import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { MatchParticipantGraphQL } from './match-participants';

/**
 * Resolver for MatchParticipant.team field.
 * Fetches the team for a match participant, returns null if no team is assigned.
 */
export const matchParticipantTeamResolver: GraphQLFieldResolver<
  MatchParticipantGraphQL,
  unknown,
  unknown,
  Promise<{ id: string } | null>
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
      id: team.id
    };
  } catch (error) {
    console.error('Error fetching team for participant:', participant.tableId, error);
    throw error;
  }
};

/**
 * Resolver for MatchParticipant.table field.
 * Fetches the table where a match participant is located.
 */
export const matchParticipantTableResolver: GraphQLFieldResolver<
  MatchParticipantGraphQL,
  unknown,
  unknown,
  Promise<{ id: string }>
> = async (participant: MatchParticipantGraphQL) => {
  try {
    const table = await db.tables.byId(participant.tableId).get();

    if (!table) {
      throw new Error(`Table not found for table ID: ${participant.tableId}`);
    }

    return {
      id: table.id
    };
  } catch (error) {
    console.error('Error fetching table for participant:', participant.tableId, error);
    throw error;
  }
};

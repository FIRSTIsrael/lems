import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { MatchParticipantGraphQL } from './match-participants';

/**
 * Resolver for MatchParticipant.table field.
 * Fetches the table where a match participant is located.
 */
export const matchParticipantTableResolver: GraphQLFieldResolver<
  MatchParticipantGraphQL,
  unknown,
  unknown,
  Promise<{ id: string; name: string }>
> = async (participant: MatchParticipantGraphQL) => {
  try {
    const table = await db.tables.byId(participant.tableId).get();

    if (!table) {
      throw new Error(`Table not found for table ID: ${participant.tableId}`);
    }

    return {
      id: table.id,
      name: table.name
    };
  } catch (error) {
    console.error('Error fetching table for participant:', participant.tableId, error);
    throw error;
  }
};

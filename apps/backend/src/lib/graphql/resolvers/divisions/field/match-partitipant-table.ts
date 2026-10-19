import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import { TableGraphQL } from '../division-tables';
import { MatchParticipantGraphQL } from './match-participants';

/**
 * Resolver for MatchParticipant.table field.
 * Fetches the table where a match participant is located.
 */
export const matchParticipantTableResolver: GraphQLFieldResolver<
  MatchParticipantGraphQL,
  unknown,
  unknown,
  Promise<TableGraphQL>
> = async (participant: MatchParticipantGraphQL) => {
  try {
    const table = await db.tables.byId(participant.tableId).get();

    if (!table) {
      throw new Error(`Table not found for table ID: ${participant.tableId}`);
    }

    return {
      id: table.id,
      name: table.name,
      pairKey: table.pair_key,
      side: table.side
    };
  } catch (error) {
    console.error('Error fetching table for participant:', participant.tableId, error);
    throw error;
  }
};

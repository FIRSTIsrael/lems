import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface JudgingWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Judging.rooms field.
 * Fetches all available judging room IDs for a division.
 */
export const judgingRoomsResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  unknown,
  Promise<string[]>
> = async (judging: JudgingWithDivisionId) => {
  try {
    const rooms = await db.rooms.byDivisionId(judging.divisionId).getAll();
    return rooms.map(room => room.id);
  } catch (error) {
    console.error('Error fetching judging rooms for division:', judging.divisionId, error);
    throw error;
  }
};

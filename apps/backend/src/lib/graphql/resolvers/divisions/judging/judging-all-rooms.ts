import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface RoomGraphQL {
  id: string;
  name: string;
}

interface JudgingWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Judging.allRooms field.
 * Fetches all room objects (with id and name) for a division.
 * Used by the judge advisor view to display rooms in the sessions grid.
 */
export const judgingAllRoomsResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  unknown,
  Promise<RoomGraphQL[]>
> = async (judging: JudgingWithDivisionId) => {
  try {
    const rooms = await db.rooms.byDivisionId(judging.divisionId).getAll();
    return rooms.map(room => ({
      id: room.id,
      name: room.name
    }));
  } catch (error) {
    console.error('Error fetching all rooms for division:', judging.divisionId, error);
    throw error;
  }
};

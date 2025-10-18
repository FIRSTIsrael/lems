import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

export interface RoomGraphQL {
  id: string;
  name: string;
}

interface DivisionWithId {
  id: string;
}

export const divisionRoomsResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  unknown,
  Promise<RoomGraphQL[]>
> = async (division: DivisionWithId) => {
  try {
    const rooms = await db.rooms.byDivisionId(division.id).getAll();
    return rooms.map(r => ({ id: r.id, name: r.name }));
  } catch (error) {
    console.error('Error fetching rooms for division:', division.id, error);
    throw error;
  }
};

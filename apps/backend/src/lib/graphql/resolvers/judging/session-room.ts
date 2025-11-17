import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface RoomGraphQL {
  id: string;
  name: string;
}

interface JudgingSessionWithRoomId {
  roomId: string;
}

/**
 * Resolver for JudgingSession.room field.
 * Fetches the room information for a judging session.
 * Only executes if the room field is requested.
 */
export const judgingSessionRoomResolver: GraphQLFieldResolver<
  JudgingSessionWithRoomId,
  unknown,
  unknown,
  Promise<RoomGraphQL>
> = async (session: JudgingSessionWithRoomId) => {
  try {
    const room = await db.rooms.byId(session.roomId).get();
    if (!room) {
      throw new Error(`Room with ID ${session.roomId} not found`);
    }
    return {
      id: room.id,
      name: room.name
    };
  } catch (error) {
    console.error('Error fetching room for judging session:', session.roomId, error);
    throw error;
  }
};

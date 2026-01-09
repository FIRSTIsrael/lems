import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface PublicDivisionVenueGraphQL {
  id: string;
  tables: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string }>;
}

/**
 * Query resolver for fetching public venue information (tables and rooms) for a division.
 * This resolver does not require authentication and is used during the login flow.
 * @throws Error if division ID is not provided or division not found
 */
export const publicDivisionVenueResolver: GraphQLFieldResolver<
  unknown,
  unknown,
  { id: string },
  Promise<PublicDivisionVenueGraphQL>
> = async (_parent, args) => {
  if (!args.id) {
    throw new Error('Division ID is required');
  }

  try {
    // Verify division exists
    const division = await db.divisions.byId(args.id).get();

    if (!division) {
      throw new Error(`Division with ID ${args.id} not found`);
    }

    // Fetch tables and rooms for this division
    const tables = await db.tables.byDivisionId(args.id).getAll();
    const rooms = await db.rooms.byDivisionId(args.id).getAll();

    return {
      id: args.id,
      tables: tables.map(t => ({ id: t.id, name: t.name })),
      rooms: rooms.map(r => ({ id: r.id, name: r.name }))
    };
  } catch (error) {
    console.error('Error fetching public division venue:', error);
    throw error;
  }
};

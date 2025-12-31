import db from '../../../database';
import type { GraphQLContext } from '../../apollo-server';
import { requireAuthAndDivisionAccess } from '../../utils/auth-helpers';

/**
 * Query resolver for fetching a single division by ID.
 * Requires user to be authenticated and assigned to the division.
 * @throws Error if division ID is not provided or division not found
 * @throws GraphQLError if user is not authenticated or doesn't have access
 */
export const divisionResolver = async (
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext
) => {
  if (!args.id) {
    throw new Error('Division ID is required');
  }

  // Require authentication and division access
  requireAuthAndDivisionAccess(context.user, args.id);

  try {
    const division = await db.divisions.byId(args.id).get();

    if (!division) {
      throw new Error(`Division with ID ${args.id} not found`);
    }

    return {
      id: division.id,
      name: division.name,
      color: division.color,
      pitMapUrl: division.pit_map_url
    };
  } catch (error) {
    console.error('Error fetching division:', error);
    throw error;
  }
};

import { MutationError, MutationErrorCode } from '@lems/types/api/lems';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

/**
 * Query resolver for fetching a single division by ID.
 * Requires user authentication and verified division assignment.
 * @throws Error if division ID is not provided, division not found, or user not authorized
 */
export const divisionResolver = async (
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext
) => {
  // Check authentication
  if (!context.user) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  // Check division assignment
  if (!args.id) {
    throw new MutationError(MutationErrorCode.UNAUTHORIZED, 'Division ID is required');
  }

  // Check if user is assigned to the requested division
  if (!context.user.divisions.includes(args.id)) {
    throw new MutationError(
      MutationErrorCode.FORBIDDEN,
      'User is not assigned to this division'
    );
  }

  try {
    const division = await db.divisions.byId(args.id).get();

    if (!division) {
      throw new MutationError(
        MutationErrorCode.UNAUTHORIZED,
        `Division with ID ${args.id} not found`
      );
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

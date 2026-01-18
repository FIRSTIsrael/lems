import db from '../../../database';

/**
 * Query resolver for fetching a single division by ID.
 * @throws Error if division ID is not provided or division not found
 */
export const divisionResolver = async (_parent: unknown, args: { id: string }) => {
  if (!args.id) {
    throw new Error('Division ID is required');
  }

  try {
    const division = await db.divisions.byId(args.id).get();

    if (!division) {
      throw new Error(`Division with ID ${args.id} not found`);
    }

    return {
      id: division.id,
      name: division.name,
      color: division.color,
      pitMapUrl: division.pit_map_url,
      awardsAssigned: division.awards_assigned
    };
  } catch (error) {
    console.error('Error fetching division:', error);
    throw error;
  }
};

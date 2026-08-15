import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

export interface FieldGraphQL {
  divisionId: string;
  loadedMatch: string | null;
  activeMatch: string | null;
}

interface DivisionWithId {
  id: string;
}

/**
 * Resolver for Division.field field.
 * Fetches field information for a division from the divisions table's state column.
 */
export const divisionFieldResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  unknown,
  Promise<FieldGraphQL>
> = async (division: DivisionWithId) => {
  try {
    const divisionRow = await db.divisions.byId(division.id).get();
    const divisionState = divisionRow?.state;

    if (!divisionState) {
      throw new Error(`Division state not found for division ID: ${division.id}`);
    }

    return {
      divisionId: division.id,
      loadedMatch: divisionState.field.loadedMatch,
      activeMatch: divisionState.field.activeMatch
    };
  } catch (error) {
    console.error('Error fetching field for division:', division.id, error);
    throw error;
  }
};

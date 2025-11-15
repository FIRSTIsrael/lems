import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

export interface TableGraphQL {
  id: string;
  name: string;
}

interface DivisionWithId {
  id: string;
}

/**
 * Resolver for Division.tables field.
 * Fetches all tables in a division.
 */
export const divisionTablesResolver: GraphQLFieldResolver<
  DivisionWithId,
  unknown,
  unknown,
  Promise<TableGraphQL[]>
> = async (division: DivisionWithId) => {
  try {
    const tables = await db.tables.byDivisionId(division.id).getAll();
    return tables.map(t => ({ id: t.id, name: t.name }));
  } catch (error) {
    console.error('Error fetching tables for division:', division.id, error);
    throw error;
  }
};

import { GraphQLFieldResolver } from 'graphql';
import { orderTablesByPair } from '@lems/shared/utils';
import db from '../../../database';
import { toPairableTable } from '../../../table-pairs';

export interface TableGraphQL {
  id: string;
  name: string;
  pairKey: string;
  side: string;
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
    return orderTablesByPair(tables.map(toPairableTable)).map(t => ({
      id: t.id,
      name: t.name,
      pairKey: t.pairKey,
      side: t.side
    }));
  } catch (error) {
    console.error('Error fetching tables for division:', division.id, error);
    throw error;
  }
};

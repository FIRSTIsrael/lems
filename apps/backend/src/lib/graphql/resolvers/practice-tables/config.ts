import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTables {
  divisionId: string;
}

export const practiceTablesConfigResolver: GraphQLFieldResolver<
  PracticeTables,
  GraphQLContext
> = async parent => {
  const config = await db.divisions.byId(parent.divisionId).practiceTables().getConfig();

  if (!config) {
    return null;
  }

  return {
    ...config,
    divisionId: parent.divisionId
  };
};

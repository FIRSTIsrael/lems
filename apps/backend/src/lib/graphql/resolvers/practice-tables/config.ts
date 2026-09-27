import { GraphQLFieldResolver } from 'graphql';
import { createPracticeTablesRepository } from '@lems/database';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTables {
  divisionId: string;
}

const practiceTablesRepo = createPracticeTablesRepository(db.raw.sql);

export const practiceTablesConfigResolver: GraphQLFieldResolver<
  PracticeTables,
  GraphQLContext
> = async parent => {
  const config = await practiceTablesRepo.getConfig(parent.divisionId);

  if (!config) {
    return null;
  }

  return {
    ...config,
    divisionId: parent.divisionId
  };
};

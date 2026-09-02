import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../../apollo-server';
import db from '../../../../database';

interface DeletePracticeTablesConfigArgs {
  divisionId: string;
}

export const deletePracticeTablesConfigResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  DeletePracticeTablesConfigArgs
> = async (_parent, { divisionId }) => {
  // Delete the configuration
  const result = await db.raw.sql
    .deleteFrom('practice_tables_config')
    .where('division_id', '=', divisionId)
    .execute();

  return true;
};

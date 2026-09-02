import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';

interface ClearPracticeTableAssignmentsArgs {
  divisionId: string;
}

export const clearPracticeTableAssignmentsResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  ClearPracticeTableAssignmentsArgs
> = async (_parent, { divisionId }) => {
  await db.raw.sql
    .deleteFrom('practice_tables_schedule')
    .where('division_id', '=', divisionId)
    .execute();

  return true;
};

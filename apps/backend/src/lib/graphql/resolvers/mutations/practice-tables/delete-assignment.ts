import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';
import type { GraphQLContext } from '../../../apollo-server';

interface DeletePracticeTableAssignmentArgs {
  assignmentId: string;
}

export const deletePracticeTableAssignmentResolver: GraphQLFieldResolver<
  unknown,
  GraphQLContext,
  DeletePracticeTableAssignmentArgs
> = async (_parent, { assignmentId }) => {
  await db.raw.sql.deleteFrom('practice_tables_schedule').where('id', '=', assignmentId).execute();

  return true;
};

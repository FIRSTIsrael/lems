import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface FieldWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Field.currentStage field.
 * Fetches the current stage (PRACTICE or RANKING) from the division state.
 */
export const currentStageResolver: GraphQLFieldResolver<
  FieldWithDivisionId,
  unknown,
  unknown,
  Promise<string>
> = async (field: FieldWithDivisionId) => {
  try {
    const division = await db.divisions.byId(field.divisionId).get();
    const divisionState = division?.state;

    if (!divisionState) {
      // Default to PRACTICE if the division state is not found
      return 'PRACTICE';
    }

    return divisionState.field.currentStage;
  } catch (error) {
    console.error('Error fetching current stage for division:', field.divisionId, error);
    throw error;
  }
};

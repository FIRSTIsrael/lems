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
    const divisionState = await db.raw.mongo
      .collection('division_states')
      .findOne({ divisionId: field.divisionId });

    if (!divisionState || !divisionState.field?.currentStage) {
      // Default to PRACTICE if no current stage is set
      return 'PRACTICE';
    }

    return divisionState.field.currentStage;
  } catch (error) {
    console.error('Error fetching current stage for division:', field.divisionId, error);
    throw error;
  }
};

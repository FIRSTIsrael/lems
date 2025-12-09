import { GraphQLFieldResolver } from 'graphql';
import { AudienceDisplayScreen } from '@lems/database';
import db from '../../../../database';

interface FieldWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Division.field field.
 * Fetches field information for a division from the division_states collection.
 */
export const audienceDisplayResolver: GraphQLFieldResolver<
  FieldWithDivisionId,
  unknown,
  unknown,
  Promise<Record<AudienceDisplayScreen, Record<string, unknown>> | null>
> = async (field: FieldWithDivisionId) => {
  try {
    const divisionState = await db.raw.mongo
      .collection('division_states')
      .findOne({ divisionId: field.divisionId });

    if (!divisionState) {
      throw new Error(`Division state not found for division ID: ${field.divisionId}`);
    }

    console.log(
      'Fetched audience display for division:',
      field.divisionId,
      divisionState.audienceDisplay
    );

    return divisionState.audienceDisplay ?? null;
  } catch (error) {
    console.error('Error fetching audience display for division:', field.divisionId, error);
    throw error;
  }
};

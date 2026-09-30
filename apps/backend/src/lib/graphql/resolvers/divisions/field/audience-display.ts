import { GraphQLFieldResolver } from 'graphql';
import { AudienceDisplay } from '@lems/database';
import db from '../../../../database';

interface FieldWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Division.audienceDisplay field.
 * Fetches field information for a division from the divisions table's state column.
 */
export const audienceDisplayResolver: GraphQLFieldResolver<
  FieldWithDivisionId,
  unknown,
  unknown,
  Promise<AudienceDisplay>
> = async (field: FieldWithDivisionId) => {
  try {
    const division = await db.divisions.byId(field.divisionId).get();
    const divisionState = division?.state;

    if (!divisionState) {
      throw new Error(`Division state not found for division ID: ${field.divisionId}`);
    }

    return divisionState.audienceDisplay;
  } catch (error) {
    console.error('Error fetching audience display for division:', field.divisionId, error);
    throw error;
  }
};

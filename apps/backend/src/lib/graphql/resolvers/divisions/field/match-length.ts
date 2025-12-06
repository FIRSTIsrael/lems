import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface FieldWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Field.matchLength field.
 * Fetches the match length (in seconds) for a division from schedule settings.
 */
export const matchLengthResolver: GraphQLFieldResolver<
  FieldWithDivisionId,
  unknown,
  unknown,
  Promise<number>
> = async (field: FieldWithDivisionId) => {
  try {
    const division = await db.divisions.byId(field.divisionId).get();

    if (!division) {
      throw new Error(`Division not found for division ID: ${field.divisionId}`);
    }

    if (!division.schedule_settings) {
      throw new Error(`Schedule settings not found for division ID: ${field.divisionId}`);
    }

    return division.schedule_settings.match_length;
  } catch (error) {
    console.error('Error fetching match length for division:', field.divisionId, error);
    throw error;
  }
};

import { GraphQLFieldResolver } from 'graphql';
import db from '../../../database';

interface JudgingWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Judging.rooms field.
 * Fetches all available judging room IDs for a division.
 */
export const judgingSessionLengthResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  unknown,
  Promise<number>
> = async (judging: JudgingWithDivisionId) => {
  try {
    const division = await db.divisions.byId(judging.divisionId).get();

    if (!division) {
      throw new Error(`Division not found for division ID: ${judging.divisionId}`);
    }

    console.log(
      'Judging session length for division',
      judging.divisionId,
      division.schedule_settings.judging_session_length
    );

    return division.schedule_settings.judging_session_length;
  } catch (error) {
    console.error('Error fetching judging rooms for division:', judging.divisionId, error);
    throw error;
  }
};

import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface JudgingWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Judging.openRubricsDuringSession field.
 * Fetches the event settings and returns whether judges can open rubrics during sessions.
 */
export const judgingOpenRubricsDuringSessionResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  unknown,
  Promise<boolean>
> = async (judging: JudgingWithDivisionId) => {
  try {
    const division = await db.divisions.byId(judging.divisionId).get();

    if (!division) {
      throw new Error(`Division not found for division ID: ${judging.divisionId}`);
    }

    const eventSettings = await db.events.byId(division.event_id).getSettings();
    return eventSettings?.open_rubrics_during_session ?? false;
  } catch (error) {
    console.error('Error resolving openRubricsDuringSession for division:', judging.divisionId, error);
    throw error;
  }
};

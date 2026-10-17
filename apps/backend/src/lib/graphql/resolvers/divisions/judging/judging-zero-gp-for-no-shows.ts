import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface JudgingWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Judging.zeroGpForNoShows field.
 * Fetches the event settings and returns whether GP scores should be zeroed out
 * for teams that no-showed their ranking match.
 */
export const judgingZeroGpForNoShowsResolver: GraphQLFieldResolver<
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
    return eventSettings?.zero_gp_for_no_shows ?? true;
  } catch (error) {
    console.error(
      'Error resolving zeroGpForNoShows for division:',
      judging.divisionId,
      error
    );
    throw error;
  }
};

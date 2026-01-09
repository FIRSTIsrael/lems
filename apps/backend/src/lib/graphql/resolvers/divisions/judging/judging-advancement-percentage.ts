import { GraphQLFieldResolver } from 'graphql';
import db from '../../../../database';

interface JudgingWithDivisionId {
  divisionId: string;
}

/**
 * Resolver for Judging.advancementPercentage field.
 * Returns the advancement percentage for a division from event settings.
 * Returns null if advancement is disabled (0%).
 */
export const judgingAdvancementPercentageResolver: GraphQLFieldResolver<
  JudgingWithDivisionId,
  unknown,
  unknown,
  Promise<number | null>
> = async (judging: JudgingWithDivisionId) => {
  try {
    const division = await db.divisions.byId(judging.divisionId).get();

    if (!division) {
      throw new Error(`Division not found for division ID: ${judging.divisionId}`);
    }

    // Get event settings to check advancement percentage
    const eventSettings = await db.events.byId(division.event_id).getSettings();

    if (!eventSettings) {
      throw new Error(`Event settings not found for division ID: ${judging.divisionId}`);
    }

    // Return null if advancement is disabled (0%), otherwise return the percentage
    return eventSettings.advancement_percent === 0 ? null : eventSettings.advancement_percent;
  } catch (error) {
    console.error('Error fetching advancement percentage for division:', judging.divisionId, error);
    throw error;
  }
};

import { getEdition } from '@lems/shared/edition';
import { getScoresheet, ScoresheetSchema } from '@lems/shared/scoresheet';
import db from '../../database';

/** Resolves the scoresheet schema for a division based on its event's season and its edition. */
export const getDivisionScoresheet = async (divisionId: string): Promise<ScoresheetSchema> => {
  const division = await db.divisions.byId(divisionId).get();
  if (!division) throw new Error(`Division ${divisionId} not found`);

  const event = await db.events.byId(division.event_id).get();
  const season = event ? await db.seasons.byId(event.season_id).get() : null;
  return getScoresheet(getEdition(division), season?.slug);
};

import { getEdition } from '@lems/shared/edition';
import { getScoresheet, ScoresheetSchema } from '@lems/shared/scoresheet';
import db from '../../database';

export const getEventSeasonSlug = async (eventId: string): Promise<string | null> => {
  const event = await db.events.byId(eventId).get();
  if (!event) return null;
  const season = await db.seasons.byId(event.season_id).get();
  return season?.slug ?? null;
};

/** Resolves the scoresheet schema for a division based on its event's season and its edition. */
export const getDivisionScoresheet = async (divisionId: string): Promise<ScoresheetSchema> => {
  const division = await db.divisions.byId(divisionId).get();
  if (!division) throw new Error(`Division ${divisionId} not found`);
  return getScoresheet(getEdition(division), await getEventSeasonSlug(division.event_id));
};

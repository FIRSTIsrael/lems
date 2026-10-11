import { getEdition, Edition } from '@lems/shared/edition';
import db from '../../database';

export const getDivisionEdition = async (divisionId: string): Promise<Edition> => {
  const division = await db.divisions.byId(divisionId).get();
  if (!division) throw new Error(`Division ${divisionId} not found`);
  return getEdition(division);
};

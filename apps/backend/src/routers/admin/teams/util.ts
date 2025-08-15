import { parse } from 'csv-parse';
import { Team as DbTeam, InsertableTeam } from '@lems/database';
import { Team } from '@lems/types/api/admin';

/**
 * Transforms a Team object into a response format.
 * @param team - The team object to transform.
 */
export const makeAdminTeamResponse = (team: DbTeam): Team => ({
  id: team.id,
  name: team.name,
  number: team.number,
  logoUrl: team.logo_url,
  affiliation: team.affiliation,
  city: team.city,
  coordinates: team.coordinates
});

export const parseTeamList = (data: Buffer<ArrayBufferLike>) => {
  return new Promise<InsertableTeam[]>((resolve, reject) => {
    const teams: InsertableTeam[] = [];
    const csvColumns = ['number', 'name', 'affiliation', 'city'];
    parse(data, { columns: csvColumns }, (err, records: InsertableTeam[]) => {
      if (err) {
        reject(err);
        return;
      }
      for (const record of records) {
        teams.push({
          number: record.number,
          name: record.name,
          affiliation: record.affiliation,
          city: record.city
        });
      }
      resolve(teams);
    });
  });
};

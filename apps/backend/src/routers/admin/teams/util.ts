import { parse } from 'csv-parse';
import {
  Team as DbTeam,
  InsertableTeam,
  TeamWithDivision as DbTeamWithDivision
} from '@lems/database';
import { Team, TeamWithDivision } from '@lems/types/api/admin';

type DbTeamWithData = DbTeam & { active?: boolean; deletable?: boolean };

/**
 * Transforms a Team object into a response format.
 * @param team - The team object to transform.
 */
export const makeAdminTeamResponse = (team: DbTeamWithData): Team => ({
  id: team.id,
  name: team.name,
  number: team.number,
  logoUrl: team.logo_url ?? null,
  affiliation: team.affiliation,
  city: team.city,
  coordinates: team.coordinates ?? null,
  active: 'active' in team ? team.active : false,
  region: team.region,

  // Optional extra fields
  deletable: team.deletable
});

export const makeAdminTeamWithDivisionResponse = (
  teamWithDivision: DbTeamWithDivision
): TeamWithDivision => {
  return {
    id: teamWithDivision.id,
    name: teamWithDivision.name,
    number: teamWithDivision.number,
    logoUrl: teamWithDivision.logo_url ?? null,
    affiliation: teamWithDivision.affiliation,
    city: teamWithDivision.city,
    coordinates: teamWithDivision.coordinates ?? null,
    region: teamWithDivision.region,
    division: {
      id: teamWithDivision.division_id,
      name: teamWithDivision.division_name,
      color: teamWithDivision.division_color
    }
  };
};

export const parseTeamList = (data: Buffer<ArrayBufferLike>) => {
  return new Promise<InsertableTeam[]>((resolve, reject) => {
    const teams: InsertableTeam[] = [];
    const csvColumns = ['number', 'name', 'affiliation', 'city', 'region'];
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
          city: record.city,
          region: record.region.toUpperCase()
        });
      }
      resolve(teams);
    });
  });
};

import { Team as DbTeam } from '@lems/database';
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

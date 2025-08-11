import { Team } from '@lems/database';
import { AdminTeamResponse } from '@lems/types/api/admin';

/**
 * Transforms a Team object into a response format.
 * @param {Team} team - The team object to transform.
 */

export const makeAdminTeamResponse = (team: Team): AdminTeamResponse => ({
  id: team.id,
  name: team.name,
  number: team.number,
  logoUrl: team.logo_url,
  affiliation: team.affiliation,
  city: team.city,
  coordinates: team.coordinates
});

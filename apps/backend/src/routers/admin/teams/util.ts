import { Team, TeamAffiliation } from '@lems/database';
import { AdminTeamResponse } from '@lems/types/api/admin';

type TeamWithAffiliation = Team & {
  affiliation: TeamAffiliation | null;
};

/**
 * Transforms a TeamWithAffiliation object into a response format.
 * @param {TeamWithAffiliation} team - The team object to transform.
 */
export const makeAdminTeamResponse = (team: TeamWithAffiliation): AdminTeamResponse => ({
  id: team.id,
  name: team.name,
  number: team.number,
  logoUrl: team.logo_url,
  affiliation: team.affiliation
    ? {
        id: team.affiliation.id,
        name: team.affiliation.name,
        city: team.affiliation.city
      }
    : null
});

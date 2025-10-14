import { Team as DbTeam } from '@lems/database';
import { Team, TeamSummary } from '@lems/types/api/portal';

export const makePortalTeamResponse = (team: DbTeam): Team => ({
  id: team.id,
  number: team.number,
  name: team.name,
  affiliation: team.affiliation,
  city: team.city,
  logoUrl: team.logo_url,
  coordinates: team.coordinates
});

export const makePortalTeamSummaryResponse = (
  team: DbTeam,
  lastCompetedSeason: string | null
): TeamSummary => ({
  ...makePortalTeamResponse(team),
  lastCompetedSeason
});

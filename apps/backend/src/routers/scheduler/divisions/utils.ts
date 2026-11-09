import { Team as DbTeam } from '@lems/database';
import { Location, Team } from '@lems/types/api/scheduler';

export const makeSchedulerTeamResponse = (team: DbTeam): Team => ({
  id: team.id,
  number: team.number,
  region: team.region,
  slug: `${team.region}-${team.number}`.toUpperCase()
});

export const makeSchedulerLocationResponse = (location: {
  id: string;
  name: string;
}): Location => ({
  id: location.id,
  name: location.name
});

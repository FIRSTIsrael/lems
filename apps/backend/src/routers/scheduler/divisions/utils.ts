import { Team as DbTeam, JudgingRoom, RobotGameTable } from '@lems/database';
import { Location, Team } from '@lems/types/api/scheduler';

export const makeSchedulerTeamResponse = (team: DbTeam): Team => ({
  id: team.id,
  number: team.number,
  region: team.region,
  slug: `${team.region}-${team.number}`
});

export const makeSchedulerLocationResponse = (
  location: RobotGameTable | JudgingRoom
): Location => ({
  id: location.id,
  name: location.name
});

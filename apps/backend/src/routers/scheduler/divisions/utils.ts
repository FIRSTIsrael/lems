import { Team as DbTeam, JudgingRoom, RobotGameTable } from '@lems/database';
import { Location, Team } from '@lems/types/api/scheduler';

export const makeSchedulerTeamResponse = (team: DbTeam): Team => ({
  id: team.id,
  number: team.number,
  region: team.region,
  slug: `${team.region}-${team.number}`.toUpperCase()
});

export const makeSchedulerLocationResponse = (
  location: RobotGameTable | JudgingRoom
): Location => ({
  id: location.id,
  name: location.name
});

export const makeSchedulerTableResponse = (table: RobotGameTable): Location => ({
  id: table.id,
  name: table.name,
  pair_key: table.pair_key,
  side: table.side
});

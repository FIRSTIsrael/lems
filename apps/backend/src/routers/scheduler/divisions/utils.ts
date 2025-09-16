import { Team as DbTeam } from '@lems/database';
import { Team } from '@lems/types/api/scheduler';

export const makeSchedulerTeamResponse = (team: DbTeam): Team => ({
  id: team.id,
  number: team.number,
});

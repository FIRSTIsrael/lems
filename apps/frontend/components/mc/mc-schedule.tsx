import { useMemo } from 'react';
import { EventState, RobotGameMatch, Team } from '@lems/types';
import { Paper, Stack } from '@mui/material';
import { WithId } from 'mongodb';

interface McScheduleProps {
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const McSchedule: React.FC<McScheduleProps> = ({ eventState, teams, matches }) => {
  const loadedMatch = useMemo(
    () => matches.find(m => m._id === eventState.loadedMatch) || null,
    [matches, eventState.loadedMatch]
  );

  return (
    <>
      <Stack>
        <Paper>activematch</Paper>
        <Paper>schedule</Paper>
      </Stack>
    </>
  );
};

export default McSchedule;

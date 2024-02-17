import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Stack, StackProps } from '@mui/material';
import { EventState, RobotGameMatch } from '@lems/types';
import ActiveMatch from './scorekeeper/active-match';

interface MatchStatusStackProps extends StackProps {
  eventState: EventState;
  matches: Array<WithId<RobotGameMatch>>;
}

const MatchStatusStack: React.FC<MatchStatusStackProps> = ({ eventState, matches, ...props }) => {
  const activeMatch = useMemo(
    () => matches.find(match => match._id === eventState.activeMatch) || null,
    [eventState.activeMatch, matches]
  );
  const loadedMatch = useMemo(
    () => matches.find(match => match._id === eventState.loadedMatch) || null,
    [eventState.loadedMatch, matches]
  );

  return (
    <Stack direction="row" spacing={2} mb={2} {...props}>
      <ActiveMatch title="מקצה רץ" match={activeMatch} startTime={activeMatch?.startTime} />
      <ActiveMatch title="המקצה הבא" match={loadedMatch} showDelay={true} />
    </Stack>
  );
};

export default MatchStatusStack;

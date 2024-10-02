import { ObjectId, WithId } from 'mongodb';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { JudgingDeliberation, Team } from '@lems/types';
import TeamSelection from '../../general/team-selection';
import DeliberationTimer from '../deliberation-timer';

interface FinalDeliberationControllerProps {
  deliberation: WithId<JudgingDeliberation>;
  teams: Array<WithId<Team>>;
}

const FinalDeliberationController: React.FC<FinalDeliberationControllerProps> = ({
  deliberation,
  teams
}) => {
  return (
    <Stack component={Paper} height="100%" alignItems="center">
      <Typography>1 ------ 2 ------3 ------4 </Typography>
      <DeliberationTimer deliberation={deliberation} startDeliberation={(a, b) => {}} />
    </Stack>
  );
};

export default FinalDeliberationController;

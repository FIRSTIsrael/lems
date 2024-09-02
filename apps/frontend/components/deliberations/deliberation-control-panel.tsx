import { WithId } from 'mongodb';
import { Team, JudgingDeliberation } from '@lems/types';
import { Button, Typography, Stack, Paper, Divider } from '@mui/material';
import DeliberationTimer from './deliberation-timer';
import TrashDroppable from './trash-droppable';
import LockDeliberationButton from './lock-deliberation-button';
import TeamSelection from '../general/team-selection';
import { localizedJudgingCategory } from '@lems/season';

interface DeliberationControlPanelProps {
  teams: Array<WithId<Team>>;
  deliberation: WithId<JudgingDeliberation>;
  startDeliberation: (divisionId: string, deliberationId: string) => void;
  lockDeliberation: (deliberation: WithId<JudgingDeliberation>) => void;
}

const DeliberationControlPanel: React.FC<DeliberationControlPanelProps> = ({
  teams,
  deliberation,
  startDeliberation,
  lockDeliberation
}) => {
  return (
    <Stack component={Paper} spacing={3} p={2} sx={{ height: '100%' }}>
      <DeliberationTimer deliberation={deliberation} startDeliberation={startDeliberation} />
      <Divider />
      <LockDeliberationButton
        deliberation={deliberation}
        deliberationName={
          deliberation.category ? localizedJudgingCategory[deliberation.category].name : 'מסכם'
        }
        lockDeliberation={lockDeliberation}
      />
      <Divider />
      <Stack spacing={1.5} direction="row" alignItems="center" justifyContent="center">
        <TeamSelection teams={teams} setTeam={() => ({})} value={null} fullWidth />
        <Typography>מול</Typography>
        <TeamSelection teams={teams} setTeam={() => ({})} value={null} fullWidth />
      </Stack>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        justifyContent="space-around"
        paddingX="8px"
      >
        <Button variant="contained" fullWidth>
          ניקוי
        </Button>
        <Button variant="contained" fullWidth>
          השוואה
        </Button>
      </Stack>
      <Divider />
      <TrashDroppable />
    </Stack>
  );
};

export default DeliberationControlPanel;

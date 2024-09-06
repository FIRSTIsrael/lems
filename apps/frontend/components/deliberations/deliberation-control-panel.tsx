import { useState } from 'react';
import { WithId } from 'mongodb';
import {
  Team,
  JudgingDeliberation,
  JudgingCategory,
  Scoresheet,
  CoreValuesForm,
  Rubric
} from '@lems/types';
import { Button, Typography, Stack, Paper, Divider } from '@mui/material';
import DeliberationTimer from './deliberation-timer';
import TrashDroppable from './trash-droppable';
import LockDeliberationButton from './lock-deliberation-button';
import TeamSelection from '../general/team-selection';
import { localizedJudgingCategory } from '@lems/season';
import CompareModal from './compare/compare-modal';

interface DeliberationControlPanelProps {
  teams: Array<WithId<Team>>;
  deliberation: WithId<JudgingDeliberation>;
  startDeliberation: (divisionId: string, deliberationId: string) => void;
  lockDeliberation: (deliberation: WithId<JudgingDeliberation>) => void;
  category?: JudgingCategory;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<CoreValuesForm>;
}

const DeliberationControlPanel: React.FC<DeliberationControlPanelProps> = ({
  teams,
  deliberation,
  startDeliberation,
  lockDeliberation,
  category,
  rubrics,
  scoresheets,
  cvForms
}) => {
  const [compareTeams, setCompareTeams] = useState<Array<WithId<Team> | null>>([null, null]);
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <>
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
          <TeamSelection
            teams={teams}
            setTeam={team => setCompareTeams(prev => [team, prev[1]])}
            value={compareTeams[0]}
            fullWidth
          />
          <Typography>מול</Typography>
          <TeamSelection
            teams={teams}
            setTeam={team => setCompareTeams(prev => [prev[0], team])}
            value={compareTeams[1]}
            fullWidth
          />
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="space-around"
          paddingX="8px"
        >
          <Button variant="contained" fullWidth onClick={() => setCompareTeams([null, null])}>
            ניקוי
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={compareTeams.some(t => !t)}
            onClick={() => setCompareOpen(true)}
          >
            השוואה
          </Button>
        </Stack>
        <Divider />
        <TrashDroppable />
      </Stack>
      {compareTeams.every(t => !!t) && (
        <CompareModal
          open={compareOpen}
          setOpen={setCompareOpen}
          compareTeamIds={compareTeams.map(t => t._id)}
          cvForms={cvForms}
          rubrics={rubrics}
          scoresheets={scoresheets}
          teams={teams}
          category={category}
        />
      )}
    </>
  );
};

export default DeliberationControlPanel;

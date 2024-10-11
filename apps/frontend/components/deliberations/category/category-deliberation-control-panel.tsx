import { useState } from 'react';
import { WithId } from 'mongodb';
import {
  Team,
  JudgingDeliberation,
  JudgingCategory,
  Scoresheet,
  CoreValuesForm,
  Rubric,
  MANDATORY_AWARD_PICKLIST_LENGTH
} from '@lems/types';
import { Button, Typography, Stack, Paper, Divider } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeliberationTimer from '../deliberation-timer';
import TrashDroppable from '../trash-droppable';
import LockCategoryDeliberationButton from './lock-category-deliberation-button';
import TeamSelection from '../../general/team-selection';
import { localizedJudgingCategory } from '@lems/season';
import CompareModal from '../compare/compare-modal';

interface DeliberationControlPanelProps {
  teams: Array<WithId<Team>>;
  deliberation: WithId<JudgingDeliberation>;
  startDeliberation: (deliberation: WithId<JudgingDeliberation>) => void;
  lockDeliberation: (deliberation: WithId<JudgingDeliberation>) => void;
  category: JudgingCategory;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<CoreValuesForm>;
}

const CategoryDeliberationControlPanel: React.FC<DeliberationControlPanelProps> = ({
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
        <LockCategoryDeliberationButton
          deliberation={deliberation}
          deliberationName={
            deliberation.category ? localizedJudgingCategory[deliberation.category].name : 'מסכם'
          }
          lockDeliberation={lockDeliberation}
          disabled={
            deliberation.status !== 'in-progress' ||
            (deliberation.awards[category]?.length ?? 0) < MANDATORY_AWARD_PICKLIST_LENGTH
          }
        />
        <Divider />
        <Stack spacing={1} alignItems="center" justifyContent="center">
          <TeamSelection
            teams={teams.filter(t => !compareTeams.find(ct => ct?._id === t._id))}
            setTeam={team => setCompareTeams(prev => [team, prev[1]])}
            value={compareTeams[0]}
            fullWidth
            size="small"
          />
          <Typography>מול</Typography>
          <TeamSelection
            teams={teams.filter(t => !compareTeams.find(ct => ct?._id === t._id))}
            setTeam={team => setCompareTeams(prev => [prev[0], team])}
            value={compareTeams[1]}
            fullWidth
            size="small"
          />
        </Stack>
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-around" px={2}>
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
          <Button
            variant="contained"
            fullWidth
            component="a"
            href="/lems/deliberations/compare"
            target="_blank"
            endIcon={<OpenInNewRoundedIcon />}
          >
            השוואות
          </Button>
        </Stack>
        <Divider />
        <TrashDroppable />
      </Stack>
      {compareTeams.every(t => !!t) && (
        <CompareModal
          open={compareOpen}
          setOpen={setCompareOpen}
          compareTeamIds={compareTeams.map(t => t?._id)}
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

export default CategoryDeliberationControlPanel;

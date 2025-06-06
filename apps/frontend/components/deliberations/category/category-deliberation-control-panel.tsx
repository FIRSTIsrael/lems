import { useState } from 'react';
import { WithId } from 'mongodb';
import {
  Team,
  JudgingDeliberation,
  JudgingCategory,
  Scoresheet,
  CoreValuesForm,
  Rubric,
  JudgingRoom,
  JudgingSession,
  Award
} from '@lems/types';
import { Button, Typography, Stack, Paper, Divider } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeliberationTimer from '../deliberation-timer';
import TrashDroppable from '../trash-droppable';
import LockCategoryDeliberationButton from './lock-category-deliberation-button';
import TeamSelection from '../../general/team-selection';
import { localizedJudgingCategory } from '@lems/season';
import CompareModal from '../compare/compare-modal';
import { getDefaultPicklistLimit } from '../../../lib/utils/math';

interface DeliberationControlPanelProps {
  teamCount: number;
  compareTeams: Array<WithId<Team>>;
  deliberation: WithId<JudgingDeliberation>;
  startDeliberation: () => void;
  lockDeliberation: () => void;
  category: JudgingCategory;
  compareProps: {
    cvForms: Array<WithId<CoreValuesForm>>;
    rubrics: Array<WithId<Rubric<JudgingCategory>>>;
    scoresheets: Array<WithId<Scoresheet>>;
    rooms: Array<WithId<JudgingRoom>>;
    sessions: Array<WithId<JudgingSession>>;
    awards: Array<WithId<Award>>;
  };
}

const CategoryDeliberationControlPanel: React.FC<DeliberationControlPanelProps> = ({
  teamCount,
  compareTeams: teams,
  deliberation,
  startDeliberation,
  lockDeliberation,
  category,
  compareProps: { cvForms, rubrics, scoresheets, sessions, rooms, awards }
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
            (deliberation.awards[category]?.length ?? 0) < getDefaultPicklistLimit(teamCount)
          }
        />
        <Divider />
        <Stack spacing={1} alignItems="center" justifyContent="center">
          <TeamSelection
            teams={teams.filter(t => t._id !== compareTeams[1]?._id)}
            setTeam={team => setCompareTeams(prev => [team, prev[1]])}
            value={compareTeams[0]}
            fullWidth
            size="small"
          />
          <Typography>מול</Typography>
          <TeamSelection
            teams={teams.filter(t => t._id !== compareTeams[0]?._id)}
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
          compareTeamIds={compareTeams.map(t => t._id)}
          cvForms={cvForms}
          rubrics={rubrics}
          scoresheets={scoresheets}
          teams={teams}
          sessions={sessions}
          rooms={rooms}
          category={category}
          awards={awards}
        />
      )}
    </>
  );
};

export default CategoryDeliberationControlPanel;

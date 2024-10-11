import { useState } from 'react';
import { WithId } from 'mongodb';
import {
  Team,
  JudgingDeliberation,
  JudgingCategory,
  Scoresheet,
  CoreValuesForm,
  Rubric,
  FinalDeliberationStage,
  FinalDeliberationStages
} from '@lems/types';
import { Button, Typography, Stack, Paper, Divider, Stepper, Step, StepLabel } from '@mui/material';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeliberationTimer from '../deliberation-timer';
import TrashDroppable from '../trash-droppable';
import TeamSelection from '../../general/team-selection';
import CompareModal from '../compare/compare-modal';
import EndDeliberationStageButton from './end-deliberation-stage-button';

interface FinalDeliberationControlPanelProps {
  deliberation: WithId<JudgingDeliberation>;
  cvForms: Array<WithId<CoreValuesForm>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
  allowManualTeamAddition?: boolean;
  additionalTeams?: Array<WithId<Team>>;
  onAddTeam?: (team: WithId<Team>) => void;
  enableTrash?: boolean;
}

const localizedStages: Record<FinalDeliberationStage, string> = {
  champions: 'פרס האליפות',
  'core-awards': 'פרסי ליבה',
  'optional-awards': 'פרסי רשות',
  review: 'סיכום'
};

const FinalDeliberationControlPanel: React.FC<FinalDeliberationControlPanelProps> = ({
  deliberation,
  cvForms,
  rubrics,
  scoresheets,
  teams,
  allowManualTeamAddition = false,
  additionalTeams = [],
  onAddTeam,
  enableTrash = false
}) => {
  const [compareTeams, setCompareTeams] = useState<Array<WithId<Team> | null>>([null, null]);
  const [compareOpen, setCompareOpen] = useState(false);
  const activeStage = FinalDeliberationStages.findIndex(stage => stage === deliberation.stage);

  return (
    <>
      <Stack component={Paper} spacing={2} p={2} sx={{ height: '100%' }}>
        <Stepper alternativeLabel activeStep={activeStage} sx={{ width: '100%', pt: 2 }}>
          {FinalDeliberationStages.map((label, index) => {
            return (
              <Step key={label} completed={index < activeStage}>
                <StepLabel>{localizedStages[label]}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <DeliberationTimer
          deliberation={deliberation}
          startDeliberation={(a, b) => {}}
          variant="linear"
        />
        <Divider />
        <Stack spacing={2} direction="row" alignItems="center">
          {allowManualTeamAddition && onAddTeam && (
            <Button variant="contained" fullWidth endIcon={<AddCircleOutlineRoundedIcon />}>
              הוספת קבוצה
            </Button>
            // TODO: actually add a team, using additionalTeams prop as the options
          )}
          <Button variant="contained" fullWidth endIcon={<BlockRoundedIcon />}>
            פסילת קבוצה
          </Button>
          <EndDeliberationStageButton
            deliberation={deliberation}
            stageName={localizedStages[deliberation.stage ?? 'champions']}
            endStage={function (deliberation: WithId<JudgingDeliberation>): void {
              throw new Error('Function not implemented.');
            }}
            fullWidth
          />
        </Stack>
        <Divider />
        <Stack spacing={1} alignItems="center" justifyContent="center" width="100%">
          <TeamSelection
            teams={teams}
            setTeam={team => setCompareTeams(prev => [team, prev[1]])}
            value={compareTeams[0]}
            fullWidth
            size="small"
          />
          <Typography>מול</Typography>
          <TeamSelection
            teams={teams}
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
        {enableTrash && <TrashDroppable />}
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
        />
      )}
    </>
  );
};

export default FinalDeliberationControlPanel;

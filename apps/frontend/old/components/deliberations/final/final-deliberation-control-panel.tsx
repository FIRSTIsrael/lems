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
  FinalDeliberationStages,
  JudgingRoom,
  JudgingSession,
  Award
} from '@lems/types';
import { Button, Typography, Stack, Paper, Divider, Stepper, Step, StepLabel } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeliberationTimer from '../deliberation-timer';
import TrashDroppable from '../trash-droppable';
import TeamSelection from '../../general/team-selection';
import CompareModal from '../compare/compare-modal';
import EndDeliberationStageButton from './end-deliberation-stage-button';
import ManualAdditionButton from '../manual-addition-button';
import DisqualificationButton from '../disqualification-button';

interface FinalDeliberationControlPanelProps {
  deliberation: WithId<JudgingDeliberation>;
  teams: Array<WithId<Team>>;
  startDeliberation: () => void;
  endDeliberationStage: () => void;
  nextStageUnlocked?: boolean;
  allowManualTeamAddition?: boolean;
  additionalTeams?: Array<WithId<Team>>;
  onAddTeam?: (team: WithId<Team>) => void;
  disqualifyTeam?: (team: WithId<Team>) => void;
  enableTrash?: boolean;
  compareProps: {
    cvForms: Array<WithId<CoreValuesForm>>;
    rubrics: Array<WithId<Rubric<JudgingCategory>>>;
    scoresheets: Array<WithId<Scoresheet>>;
    rooms: Array<WithId<JudgingRoom>>;
    sessions: Array<WithId<JudgingSession>>;
    awards: Array<WithId<Award>>;
  };
}

const localizedStages: Record<FinalDeliberationStage, string> = {
  champions: 'פרס האליפות',
  'core-awards': 'פרסי ליבה',
  'optional-awards': 'פרסי רשות',
  review: 'סיכום'
};

const FinalDeliberationControlPanel: React.FC<FinalDeliberationControlPanelProps> = ({
  deliberation,
  teams,
  startDeliberation,
  endDeliberationStage,
  nextStageUnlocked,
  allowManualTeamAddition = false,
  additionalTeams,
  onAddTeam,
  disqualifyTeam,
  enableTrash = false,
  compareProps: { cvForms, rubrics, scoresheets, sessions, rooms, awards }
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
          startDeliberation={startDeliberation}
          variant="linear"
        />
        <Divider />
        <Stack spacing={2} direction="row" alignItems="center">
          {allowManualTeamAddition && additionalTeams && onAddTeam && (
            <ManualAdditionButton
              additionalTeams={additionalTeams}
              onAddTeam={onAddTeam}
              disabled={deliberation.status !== 'in-progress'}
              fullWidth
            />
          )}
          {disqualifyTeam && (
            <DisqualificationButton
              teams={teams}
              disqualifyTeam={disqualifyTeam}
              disabled={deliberation.status !== 'in-progress'}
              fullWidth
            />
          )}
          <EndDeliberationStageButton
            deliberation={deliberation}
            stageName={localizedStages[deliberation.stage ?? 'champions']}
            disabled={!nextStageUnlocked || deliberation.status !== 'in-progress'}
            endStage={endDeliberationStage}
            fullWidth
          />
        </Stack>
        <Divider />
        <Stack spacing={1} alignItems="center" justifyContent="center" width="100%">
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
        {enableTrash && <TrashDroppable />}
      </Stack>
      {compareTeams.every(t => !!t) && (
        <CompareModal
          open={compareOpen}
          setOpen={setCompareOpen}
          compareTeamIds={compareTeams.map(t => t?._id)}
          cvForms={cvForms}
          rubrics={rubrics}
          sessions={sessions}
          rooms={rooms}
          scoresheets={scoresheets}
          teams={teams}
          awards={awards}
        />
      )}
    </>
  );
};

export default FinalDeliberationControlPanel;

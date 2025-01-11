import { useState } from 'react';
import { WithId } from 'mongodb';
import { useRouter } from 'next/router';
import { Box, Stack, Step, StepLabel, Stepper, Paper } from '@mui/material';
import { Division, FllEvent, ScheduleGenerationSettings } from '@lems/types';
import UploadTeamsStep from './schedule-generator/upload-teams-step';
import VenueSetupStep from './schedule-generator/venue-setup-step';
import TimingStep from './schedule-generator/timing-step';
import DeleteDivisionData from './delete-division-data';
import ReviewStep from './schedule-generator/review-step';
import { apiFetch } from 'apps/frontend/lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';

const SchedulerStages = ['upload-teams', 'venue-setup', 'timing', 'review'];
export type SchedulerStage = (typeof SchedulerStages)[number];

const localizedStages: Record<SchedulerStage, string> = {
  'upload-teams': 'העלאת קבוצות',
  'venue-setup': 'פרטי תחרות',
  timing: 'הגדרת זמנים',
  review: 'סיכום'
};

interface DivisionScheduleEditorProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
}

const DivisionScheduleEditor: React.FC<DivisionScheduleEditorProps> = ({ division, event }) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [settings, setSettings] = useState<ScheduleGenerationSettings>({
    practiceRounds: 1,
    rankingRounds: 3,
    isStaggered: true,
    matchesStart: null,
    judgingStart: null,
    practiceCycleTimeSeconds: null,
    rankingCycleTimeSeconds: null,
    judgingCycleTimeSeconds: null,
    breaks: []
  });

  if (division.hasState) {
    return (
      <Paper sx={{ p: 4 }}>
        <DeleteDivisionData division={{ ...division, event }} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Stack width="100%" spacing={5} justifyContent="center" px={3}>
        <Stepper alternativeLabel activeStep={activeStep} sx={{ width: '100%', pt: 2 }}>
          {SchedulerStages.map((label, index) => {
            return (
              <Step key={label} completed={index < activeStep}>
                <StepLabel>{localizedStages[label]}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        <Stack width="100%" alignItems="center" spacing={5}>
          <Box width="80%" justifyContent="center">
            {activeStep === 0 && (
              <UploadTeamsStep division={division} advanceStep={() => setActiveStep(1)} />
            )}
            {activeStep === 1 && (
              <VenueSetupStep
                division={division}
                settings={settings}
                updateSettings={setSettings}
                advanceStep={() => setActiveStep(2)}
                goBack={() => setActiveStep(0)}
              />
            )}
            {activeStep === 2 && (
              <TimingStep
                division={division}
                settings={settings}
                updateSettings={setSettings}
                advanceStep={() => setActiveStep(3)}
                goBack={() => setActiveStep(1)}
              />
            )}
            {activeStep === 3 && (
              <ReviewStep
                division={division}
                settings={settings}
                advanceStep={() => {
                  apiFetch(`/api/admin/divisions/${division._id}/schedule/generate`, {
                    method: 'POST',
                    body: JSON.stringify(settings),
                    headers: { 'Content-Type': 'application/json' }
                  }).then(res => {
                    if (res.ok) {
                      enqueueSnackbar('לו"ז נוצר בהצלחה', { variant: 'success' });
                      router.reload();
                    } else {
                      enqueueSnackbar('שגיאה ביצירת הלו"ז', { variant: 'error' });
                    }
                  });
                }}
                goBack={() => setActiveStep(2)}
              />
            )}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DivisionScheduleEditor;

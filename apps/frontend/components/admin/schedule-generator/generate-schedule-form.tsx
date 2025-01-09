import { useState, useEffect } from 'react';
import { WithId } from 'mongodb';
import { Form, Formik, useFormikContext } from 'formik';
import { Box, Button, Stack, Step, StepLabel, Stepper } from '@mui/material';
import { Division, Team, JudgingRoom, RobotGameTable } from '@lems/types';
import UploadTeamsStep from './upload-teams-step';
import VenueSetupStep from './venue-setup-step';
import TimingStep from './timing-step';
import { apiFetch } from '../../../lib/utils/fetch';

const SchedulerStages = ['upload-teams', 'venue-setup', 'timing', 'review'];
export type SchedulerStage = (typeof SchedulerStages)[number];

const localizedStages: Record<SchedulerStage, string> = {
  'upload-teams': 'העלאת קבוצות',
  'venue-setup': 'פרטי תחרות',
  timing: 'הגדרת זמנים',
  review: 'סיכום'
};

interface GenerateScheduleFormValues {
  teamsUploaded: boolean;
  roomsLoaded: boolean;
  tablesLoaded: boolean;
  isStaggered: boolean;
  practiceRounds: number;
  rankingRounds: number;
  matchesStart: Date | null;
  judgingStart: Date | null;
}

interface GenerateScheduleFormikFormProps {
  division: WithId<Division>;
  activeStep: number;
  handleNext: () => void;
  handleBack: () => void;
}

const GenerateScheduleFormikForm: React.FC<GenerateScheduleFormikFormProps> = ({
  division,
  activeStep,
  handleNext,
  handleBack
}) => {
  const { values, setFieldValue, isValid, validateForm } =
    useFormikContext<GenerateScheduleFormValues>();
  const [teams, _setTeams] = useState<Array<WithId<Team>>>([]);
  const [roomNames, _setRoomNames] = useState<Array<string>>([]);
  const [tableNames, _setTableNames] = useState<Array<string>>([]);

  const setTeams = (teams: Array<WithId<Team>>) => {
    _setTeams(teams);
    setFieldValue('teamsUploaded', teams.length > 0);
  };

  const setRoomNames = (rooms: Array<string>) => {
    _setRoomNames(rooms);
    setFieldValue('roomsLoaded', rooms.length > 0);
  };

  const setTableNames = (tables: Array<string>) => {
    _setTableNames(tables);
    setFieldValue('tablesLoaded', tables.length > 0);
  };

  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  useEffect(() => {
    if (values.teamsUploaded) return;
    apiFetch(`/api/divisions/${division._id}/teams`).then(res => {
      res.json().then(data => {
        setTeams(data);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.teamsUploaded]);

  useEffect(() => {
    if (values.roomsLoaded) return;
    apiFetch(`/api/divisions/${division._id}/rooms`).then(res => {
      res.json().then(data => {
        setRoomNames(data.map((room: WithId<JudgingRoom>) => room.name));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.roomsLoaded]);

  useEffect(() => {
    if (values.tablesLoaded) return;
    apiFetch(`/api/divisions/${division._id}/tables`).then(res => {
      res.json().then(data => {
        setTableNames(data.map((table: WithId<RobotGameTable>) => table.name));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.tablesLoaded]);

  return (
    <Stack width="100%" alignItems="center" spacing={5}>
      <Box width="80%" justifyContent="center">
        {activeStep === 0 && (
          <UploadTeamsStep
            division={division}
            teams={teams}
            onSuccess={() => setFieldValue('teamsUploaded', true)}
            onError={() => setFieldValue('teamsUploaded', false)}
          />
        )}
        {activeStep === 1 && (
          <VenueSetupStep
            division={division}
            rooms={roomNames}
            setRooms={setRoomNames}
            tables={tableNames}
            setTables={setTableNames}
          />
        )}
        {activeStep === 2 && <TimingStep division={division} />}
      </Box>
      <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" px={2}>
        <Button variant="contained" onClick={handleBack} disabled={activeStep === 0}>
          הקודם
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={!isValid}>
          הבא
        </Button>
      </Stack>
    </Stack>
  );
};

interface GenerateScheduleFormProps {
  division: WithId<Division>;
}

const GenerateScheduleForm: React.FC<GenerateScheduleFormProps> = ({ division }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  return (
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

      <Formik
        validate={values => {
          const errors: Record<string, string> = {};
          if (activeStep === 0 && !values.teamsUploaded) {
            errors.teamsUploaded = 'יש להעלות קבוצות';
          }
          if (activeStep === 1 && !values.roomsLoaded) {
            errors.roomsUploaded = 'יש להגדיר חדרים';
          }
          if (activeStep === 1 && !values.tablesLoaded) {
            errors.tablesUploaded = 'יש להגדיר שולחנות';
          }
          if (activeStep === 2 && !values.matchesStart) {
            errors.matchesStart = 'יש להגדיר זמן התחלת מקצים';
          }
          if (activeStep === 2 && !values.judgingStart) {
            errors.judgingStart = 'יש להגדיר זמן התחלת שיפוט';
          }
          return errors;
        }}
        validateOnMount={true}
        validateOnChange={true}
        initialValues={
          {
            teamsUploaded: false,
            roomsLoaded: false,
            tablesLoaded: false,
            isStaggered: true,
            matchesStart: null,
            judgingStart: null,
            practiceRounds: 1,
            rankingRounds: 3
          } as GenerateScheduleFormValues
        }
        onSubmit={async values => {
          console.log(values);
        }}
      >
        {() => (
          <Form>
            <GenerateScheduleFormikForm
              division={division}
              activeStep={activeStep}
              handleNext={handleNext}
              handleBack={handleBack}
            />
          </Form>
        )}
      </Formik>
    </Stack>
  );
};

export default GenerateScheduleForm;

import React from 'react';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Form, Formik, FormikValues } from 'formik';
import ReactMarkdown from 'react-markdown';
import { Typography, Button, Alert, Stack, SxProps, Theme } from '@mui/material';
import { purple } from '@mui/material/colors';
import {
  Event,
  Team,
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  SafeUser,
  Scoresheet
} from '@lems/types';
import { fullMatch } from '@lems/utils';
import { SEASON_SCORESHEET } from '@lems/season';
import { enqueueSnackbar } from 'notistack';
import { RoleAuthorizer } from '../../role-authorizer';
import ScoresheetMission from './scoresheet-mission';

interface Props {
  event: WithId<Event>;
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
  user: WithId<SafeUser>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ScoresheetForm: React.FC<Props> = ({ event, team, scoresheet, user, socket }) => {
  const router = useRouter();
  const isEditable = true;

  const getDefaultScoresheet = () => {
    const missions = SEASON_SCORESHEET.missions.map(m => {
      return {
        id: m.id,
        clauses: m.clauses.map(c => {
          return { type: c.type, value: c.default };
        })
      };
    });
    return { missions: missions, signature: '', gp: 0, score: 0 };
  };

  const handleSync = async (
    showSnackbar: boolean,
    formValues: FormikValues | undefined,
    newstatus: string | undefined
  ) => {
    console.log(formValues);
    const updatedScoresheet = {} as any;
    if (newstatus) updatedScoresheet['status'] = newstatus;
    if (formValues) updatedScoresheet['data'] = formValues;
    console.log(updatedScoresheet);

    socket.emit(
      'updateScoresheet',
      event._id.toString(),
      team._id.toString(),
      scoresheet._id.toString(),
      updatedScoresheet as Partial<Scoresheet>,
      response => {
        if (response.ok) {
          if (showSnackbar) {
            enqueueSnackbar('דף הניקוד נשמר בהצלחה.', { variant: 'success' });
          }
        } else {
          enqueueSnackbar('אופס, שמירת דף הניקוד נכשלה.', { variant: 'error' });
        }
      }
    );
  };

  const validateScoresheet = (formValues: FormikValues) => {
    const errors: any = {};

    if (isEditable) {
      const isCompleted = Object.keys(errors).length === 0;
      const isEmpty = Object.values(formValues).filter(x => !!x).length === 0;

      // TODO: scoresheet status
      let newStatus = undefined;
      if (isEmpty) {
        newStatus = 'empty';
      } else if (!isCompleted) {
        newStatus = 'in-progress';
      } else if (isCompleted && ['empty', 'in-progress', 'completed'].includes(scoresheet.status)) {
        newStatus = 'completed';
      } else if (isCompleted && ['waiting-for-review', 'ready'].includes(scoresheet.status)) {
        newStatus = scoresheet.status;
      }

      if (!fullMatch(scoresheet.data, formValues) || scoresheet.status !== newStatus) {
        handleSync(false, formValues, newStatus);
      }
    }

    return errors;
  };

  const actionButtonStyle: SxProps<Theme> = {
    minWidth: 120,
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: purple[500],
    '&:hover': {
      backgroundColor: purple[700]
    }
  };

  return (
    <>
      <Formik
        initialValues={scoresheet.data || getDefaultScoresheet()}
        validate={validateScoresheet}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values, actions) => {
          // This should return to the referee page
          actions.setSubmitting(false);
        }}
        enableReinitialize
        validateOnMount
      >
        {({ values, isValid, validateForm, resetForm }) => (
          <Form>
            <Stack
              spacing={2}
              sx={{
                maxWidth: '20rem',
                mx: 'auto',
                my: 4
              }}
            >
              {!isEditable && (
                <Alert
                  severity="warning"
                  sx={{
                    fontWeight: 500,
                    border: '1px solid #ff9800'
                  }}
                >
                  דף הניקוד נעול, אין באפשרותך לערוך אותו.
                </Alert>
              )}
            </Stack>

            <Stack spacing={4}>
              {SEASON_SCORESHEET.missions.map(mission => (
                <ScoresheetMission
                  key={mission.id}
                  src={`/assets/scoresheet/missions/${mission.id}.webp`}
                  mission={mission}
                />
              ))}
            </Stack>

            {!isValid && (
              <Alert
                severity="warning"
                sx={{
                  fontWeight: 500,
                  mb: 4,
                  maxWidth: '20rem',
                  mx: 'auto',
                  border: '1px solid #ff9800'
                }}
              >
                דף הניקוד אינו מלא.
              </Alert>
            )}

            <Stack direction="row" spacing={4} justifyContent="center"></Stack>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ScoresheetForm;

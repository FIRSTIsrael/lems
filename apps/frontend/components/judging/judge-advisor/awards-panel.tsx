import { useState } from 'react';
import { Formik, Form, FormikValues } from 'formik';
import { enqueueSnackbar } from 'notistack';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import {
  Typography,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { localizedAward } from '@lems/season';
import { fullMatch } from '@lems/utils/objects';
import {
  Award,
  Event,
  Team,
  AwardNames,
  WSServerEmittedEvents,
  WSClientEmittedEvents
} from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import AwardWinnerSelector from './award-winner-selector';
import ResultExportPaper from './result-export-paper';
import AdvancingTeamsSelector from './advancing-teams-selector';

interface AwardsPanelProps {
  awards: Array<WithId<Award>>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  readOnly: boolean;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AwardsPanel: React.FC<AwardsPanelProps> = ({ awards, event, teams, readOnly, socket }) => {
  const [open, setOpen] = useState<boolean>(false);

  const validateForm = (formValues: FormikValues) => {
    const errors: any = {};

    formValues.awards.forEach((award: WithId<Award>) => {
      if (typeof award.winner === 'string' || !award.winner || award.name === 'robotPerformance')
        return;

      if (
        formValues.awards.find(
          (a: WithId<Award>) =>
            !fullMatch(a, award) &&
            fullMatch(a.winner, award.winner) &&
            a.name !== 'robotPerformance'
        )
      )
        errors[award.name] = 'לא ניתן לחלק פרס לקבוצה יותר מפעם אחת.';
    });

    return errors;
  };

  return (
    <>
      <ResultExportPaper event={event} />
      <Formik
        initialValues={{
          awards: awards.map(a => {
            if (!a.winner) a.winner = '';
            return a;
          }),
          advancingTeams: teams.filter(t => t.advancing)
        }}
        validate={validateForm}
        onSubmit={(values, actions) => {
          apiFetch(`/api/events/${event._id}/awards/winners`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
          })
            .then(res => {
              if (res.ok) {
                enqueueSnackbar('זוכי הפרסים נשמרו בהצלחה!', { variant: 'success' });
              } else {
                enqueueSnackbar('אופס, לא הצלחנו לשמור את זוכי הפרסים.', {
                  variant: 'error'
                });
              }
            })
            .then(() => actions.setSubmitting(false));
        }}
        validateOnMount
      >
        {({ submitForm, isSubmitting, isValid, values, errors }) => (
          <Form>
            <Stack spacing={2}>
              {awards.map((a, index) => (
                <AwardWinnerSelector
                  key={a._id.toString()}
                  award={a}
                  awardIndex={index}
                  teams={teams.filter(t => t.registered)}
                  readOnly={readOnly}
                />
              ))}
              <AdvancingTeamsSelector teams={teams.filter(t => t.registered)} readOnly={readOnly} />
            </Stack>
            {!isValid && (
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  fontWeight: 500,
                  border: '1px solid #ff2f00'
                }}
              >
                הפרסים הבאים ניתנו לאותן קבוצות:{' '}
                {Object.keys(errors)
                  .map(award => localizedAward[award as AwardNames].name)
                  .join(', ')}
              </Alert>
            )}
            <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
              {awards.length > 0 &&
                (!readOnly ? (
                  <>
                    {/* <LoadingButton
                      startIcon={<SaveOutlinedIcon />}
                      sx={{ minWidth: 250 }}
                      variant="contained"
                      onClick={submitForm}
                      loading={isSubmitting}
                      disabled={!isValid || readOnly}
                    >
                      <span>שמירה</span>
                    </LoadingButton> */}
                    <Button
                      startIcon={<LockOutlinedIcon />}
                      sx={{ minWidth: 250 }}
                      variant="contained"
                      onClick={() => setOpen(true)}
                      disabled={!values.awards.every(x => x.winner) || !isValid || readOnly}
                    >
                      נעילת הפרסים
                    </Button>
                    <Dialog
                      open={open}
                      onClose={() => setOpen(false)}
                      aria-labelledby="lock-awards-title"
                      aria-describedby="lock-awards-description"
                    >
                      <DialogTitle id="logout-title">נעילת פרסי האירוע</DialogTitle>
                      <DialogContent>
                        <DialogContentText id="logout-description">
                          פעולה זו לא תאפשר לאף אחד לערוך את הפרסים יותר. האם אתם בטוחים שברצונכם
                          לנעול את הפרסים?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setOpen(false)}>ביטול</Button>
                        <Button
                          onClick={() => {
                            submitForm();
                            socket.emit(
                              'updatePresentation',
                              event._id.toString(),
                              'awards',
                              { enabled: true },
                              response => {
                                if (!response.ok) {
                                  enqueueSnackbar('אופס, לא הצלחנו לנעול את הפרסים.', {
                                    variant: 'error'
                                  });
                                }
                              }
                            );
                            setOpen(false);
                          }}
                          autoFocus
                        >
                          אישור
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                ) : (
                  <Typography>לא ניתן לערוך יותר את הפרסים</Typography>
                ))}
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AwardsPanel;

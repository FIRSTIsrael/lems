import { useState } from 'react';
import { Formik, Form } from 'formik';
import { enqueueSnackbar } from 'notistack';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import {
  Paper,
  Box,
  Avatar,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Grid from '@mui/material/Unstable_Grid2';
import { Award, Event, Team, WSServerEmittedEvents, WSClientEmittedEvents } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import AwardWinnerSelector from './award-winner-selector';
import ExportAction from './export-action';

interface AwardsPanelProps {
  awards: Array<WithId<Award>>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  readOnly: boolean;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AwardsPanel: React.FC<AwardsPanelProps> = ({ awards, event, teams, readOnly, socket }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            pb: 3
          }}
        >
          <Avatar
            sx={{
              bgcolor: '#ccfbf1',
              color: '#2dd4bf',
              width: '2rem',
              height: '2rem',
              mr: 1
            }}
          >
            <ManageIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
          <Typography variant="h2" fontSize="1.25rem">
            ניהול
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid xs={6}>
            <ExportAction event={event} path="/rubrics/core-values" sx={{ m: 1 }}>
              ייצוא מחווני ערכי הליבה
            </ExportAction>
          </Grid>
          <Grid xs={6}>
            <ExportAction event={event} path="/rubrics/innovation-project" sx={{ m: 1 }}>
              ייצוא מחווני פרויקט החדשנות
            </ExportAction>
          </Grid>
          <Grid xs={6}>
            <ExportAction event={event} path="/rubrics/robot-design" sx={{ m: 1 }}>
              ייצוא מחווני תכנון הרובוט
            </ExportAction>
          </Grid>
          <Grid xs={6}>
            <ExportAction event={event} path="/scores" sx={{ m: 1 }}>
              ייצוא תוצאות זירה
            </ExportAction>
          </Grid>
        </Grid>
      </Paper>
      <Formik
        initialValues={awards.map(a => {
          if (!a.winner) a.winner = '';
          return a;
        })}
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
      >
        {({ submitForm, isSubmitting, values }) => (
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
            </Stack>
            <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
              {awards.length > 0 &&
                (!readOnly ? (
                  <>
                    <LoadingButton
                      startIcon={<SaveOutlinedIcon />}
                      sx={{ minWidth: 250 }}
                      variant="contained"
                      onClick={submitForm}
                      loading={isSubmitting}
                    >
                      <span>שמירה</span>
                    </LoadingButton>
                    <Button
                      startIcon={<LockOutlinedIcon />}
                      sx={{ minWidth: 250 }}
                      variant="contained"
                      onClick={() => setOpen(true)}
                      disabled={!values.every(x => x.winner)}
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
                          onClick={() =>
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
                            )
                          }
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

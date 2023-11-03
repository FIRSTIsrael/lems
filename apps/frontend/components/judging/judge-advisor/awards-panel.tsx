import { Formik, Form } from 'formik';
import { enqueueSnackbar } from 'notistack';
import { WithId } from 'mongodb';
import { Paper, Box, Avatar, Typography, Grid, Stack, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Award, Event, Team } from '@lems/types';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { apiFetch } from '../../../lib/utils/fetch';
import AwardWinnerSelector from './award-winner-selector';
import ExportAction from './export-action';

interface AwardsPanelProps {
  awards: Array<WithId<Award>>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const AwardsPanel: React.FC<AwardsPanelProps> = ({ awards, event, teams }) => {
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
        <Grid container>
          <Grid xs={4}>
            <ExportAction event={event} path="/rubrics/core-values" sx={{ m: 1 }}>
              ייצוא מחווני ערכי הליבה
            </ExportAction>
          </Grid>

          <Grid xs={4}>
            <ExportAction event={event} path="/rubrics/innovation-project" sx={{ m: 1 }}>
              ייצוא מחווני פרויקט חדשנות
            </ExportAction>
          </Grid>
          <Grid xs={4}>
            <ExportAction event={event} path="/rubrics/robot-design" sx={{ m: 1 }}>
              ייצוא מחווני תכנון הרובוט
            </ExportAction>
          </Grid>
          <Grid xs={4}>
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
        {({ submitForm, isSubmitting }) => (
          <Form>
            <Stack spacing={2}>
              {awards.map((a, index) => (
                <AwardWinnerSelector
                  key={a._id.toString()}
                  award={a}
                  awardIndex={index}
                  teams={teams.filter(t => t.registered)}
                />
              ))}
            </Stack>
            {awards.length > 0 && (
              <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                <LoadingButton
                  startIcon={<SaveOutlinedIcon />}
                  sx={{ minWidth: 250 }}
                  variant="contained"
                  onClick={submitForm}
                  loading={isSubmitting}
                >
                  <span>שמירה</span>
                </LoadingButton>
                {true && (
                  <Button
                    startIcon={<LockOutlinedIcon />}
                    sx={{ minWidth: 250 }}
                    variant="contained"
                    onClick={submitForm}
                  >
                    נעילת הפרסים
                  </Button>
                )}
              </Stack>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AwardsPanel;

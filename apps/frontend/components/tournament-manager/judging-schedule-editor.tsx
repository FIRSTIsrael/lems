import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { Formik, Form, FormikValues, FormikHelpers } from 'formik';
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Event,
  Team,
  JudgingRoom,
  JudgingSession,
  JUDGING_SESSION_LENGTH,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import JudgingEditorTeamCell from './judging-editor-team-cell';
import { LoadingButton } from '@mui/lab';
interface JudgingScheduleEditorRowProps {
  number: number;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
}

const JudgingScheduleEditorRow: React.FC<JudgingScheduleEditorRowProps> = ({
  number,
  sessions,
  rooms,
  teams
}) => {
  const startTime = dayjs(sessions.find(s => s.number === number)?.scheduledTime);

  return (
    <TableRow>
      <TableCell>{startTime.format('HH:mm')}</TableCell>
      <TableCell>{startTime.add(JUDGING_SESSION_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      {rooms.map(r => {
        const session = sessions.find(s => s.number === number && s.roomId === r._id);

        return (
          <JudgingEditorTeamCell
            key={r._id.toString()}
            teams={teams}
            name={`${session?._id.toString()}`}
            disabled={session?.status !== 'not-started'}
          />
        );
      })}
    </TableRow>
  );
};

interface JudgingScheduleEditorProps {
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const JudgingScheduleEditor: React.FC<JudgingScheduleEditorProps> = ({
  event,
  teams,
  rooms,
  sessions,
  socket
}) => {
  const getInitialValues = () => {
    return Object.fromEntries(
      sessions.map(s => [s._id.toString(), teams.find(t => t._id === s.teamId) || null])
    );
  };

  const handleSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>) => {
    const sessionsChanged = Object.keys(values).filter(
      sessionId =>
        sessions.find(s => s._id.toString() === sessionId)?.teamId?.toString() !==
        values[sessionId]?._id
    );

    Promise.all(
      sessionsChanged.map(sessionId => {
        return new Promise((resolve, reject) => {
          if (!socket) reject('No socket connection.');
          socket.emit(
            'updateJudgingSessionTeam',
            event._id.toString(),
            sessionId,
            values[sessionId]?._id.toString() || null,
            response => {
              response.ok ? resolve(response) : reject(response);
            }
          );
        });
      })
    )
      .then(() => enqueueSnackbar('מפגשי השיפוט עודכנו בהצלחה!', { variant: 'success' }))
      .catch(() => enqueueSnackbar('אופס, עדכון אחד ממפגשי השיפוט נכשל.', { variant: 'error' }))
      .finally(() => actions.setSubmitting(false));
  };

  return (
    <Formik initialValues={getInitialValues()} enableReinitialize onSubmit={handleSubmit}>
      {({ resetForm, submitForm, isSubmitting }) => (
        <Form>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>התחלה</TableCell>
                  <TableCell>סיום</TableCell>
                  {rooms.map(room => (
                    <TableCell key={room._id.toString()} align="left">
                      חדר {room.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...new Set(sessions.flatMap(s => s.number))].map(row => {
                  return (
                    <JudgingScheduleEditorRow
                      key={row}
                      number={row}
                      teams={teams}
                      sessions={sessions}
                      rooms={rooms}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack justifyContent="center" direction="row" mt={2} spacing={2}>
            <LoadingButton
              startIcon={<SaveOutlinedIcon />}
              sx={{ minWidth: 200 }}
              variant="contained"
              onClick={submitForm}
              loading={isSubmitting}
            >
              <span>שמירה</span>
            </LoadingButton>
            <Button
              startIcon={<RestartAltIcon />}
              sx={{ minWidth: 200 }}
              variant="contained"
              color="warning"
              onClick={() => resetForm()}
            >
              ביטול
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default JudgingScheduleEditor;

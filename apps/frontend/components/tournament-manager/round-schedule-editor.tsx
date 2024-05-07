import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Form, Formik, FormikHelpers, FormikValues } from 'formik';
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
  EventState,
  Team,
  MATCH_LENGTH,
  RobotGameMatch,
  RobotGameTable,
  RobotGameMatchStage,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  RobotGameMatchParticipant
} from '@lems/types';
import { localizedMatchStage } from '../../localization/field';
import RoundEditorTeamCell from './round-editor-team-cell';
import { fullMatch } from '@lems/utils/objects';
import { enqueueSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import { LoadingButton } from '@mui/lab';

interface RoundScheduleEditorRowProps {
  divisionState: WithId<EventState>;
  match: WithId<RobotGameMatch>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
}

const RoundScheduleEditorRow: React.FC<RoundScheduleEditorRowProps> = ({
  divisionState,
  match,
  tables,
  teams
}) => {
  const startTime = dayjs(match.scheduledTime);

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell align="center">{match.number}</TableCell>
      <TableCell align="center">{startTime.format('HH:mm')}</TableCell>
      <TableCell align="center">{startTime.add(MATCH_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      {tables.map(table => {
        return (
          <RoundEditorTeamCell
            key={table._id.toString()}
            teams={teams}
            name={`${match._id}.${table._id}`}
            disabled={
              match.status !== 'not-started' ||
              match._id.toString() === divisionState.loadedMatch?.toString()
            }
          />
        );
      })}
    </TableRow>
  );
};

interface RoundScheduleEditorProps {
  division: WithId<Event>;
  divisionState: WithId<EventState>;
  roundStage: RobotGameMatchStage;
  roundNumber: number;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const RoundScheduleEditor: React.FC<RoundScheduleEditorProps> = ({
  division,
  divisionState,
  roundStage,
  roundNumber,
  matches,
  tables,
  teams,
  socket
}) => {
  const getInitialValues = () => {
    return Object.fromEntries(
      matches.map(m => [
        m._id.toString(),
        Object.fromEntries(
          m.participants.map(p => [p.tableId, teams.find(t => t._id === p.teamId)])
        )
      ])
    );
  };

  const handleSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>) => {
    const matchesChanged = Object.keys(values).filter(
      matchId =>
        !fullMatch(
          matches.find(m => m._id.toString() === matchId)?.participants.map(p => p.team),
          Object.values(values[matchId])
        )
    );

    Promise.all(
      matchesChanged.map(matchId => {
        const toUpdate = Object.entries(values[matchId]).map(([tableId, team]: [string, any]) => {
          return { tableId, teamId: team?._id || null } as unknown;
        }) as Array<Partial<RobotGameMatchParticipant>>;

        return new Promise((resolve, reject) => {
          if (!socket) reject('No socket connection.');
          socket.emit('updateMatchTeams', division._id.toString(), matchId, toUpdate, response => {
            response.ok ? resolve(response) : reject(response);
          });
        });
      })
    )
      .then(() => enqueueSnackbar('המקצים עודכנו בהצלחה!', { variant: 'success' }))
      .catch(() => enqueueSnackbar('אופס, עדכון אחד המקצים נכשל.', { variant: 'error' }))
      .finally(() => actions.setSubmitting(false));
  };

  return (
    <Formik initialValues={getInitialValues()} enableReinitialize onSubmit={handleSubmit}>
      {({ resetForm, submitForm, isSubmitting }) => (
        <Form>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={3 + tables.length} align="center">
                    סבב {localizedMatchStage[roundStage]} #{roundNumber}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center">מקצה</TableCell>
                  <TableCell align="center">התחלה</TableCell>
                  <TableCell align="center">סיום</TableCell>
                  {tables.map(table => (
                    <TableCell key={table._id.toString()} align="left">
                      {`שולחן ${table.name}`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map(m => (
                  <RoundScheduleEditorRow
                    divisionState={divisionState}
                    match={m}
                    tables={tables}
                    teams={teams}
                    key={m._id.toString()}
                  />
                ))}
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

export default RoundScheduleEditor;

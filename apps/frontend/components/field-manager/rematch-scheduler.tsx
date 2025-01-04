import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Socket } from 'socket.io-client';
import {
  DivisionState,
  JudgingSession,
  JudgingRoom,
  RobotGameMatch,
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import EventWidget from './event-widget';

interface RematchSchedulerProps {
  team: WithId<Team>;
  divisionState: WithId<DivisionState>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const RematchScheduler: React.FC<RematchSchedulerProps> = ({
  team,
  divisionState,
  rooms,
  matches,
  sessions,
  socket
}) => {
  // All teams must have a session.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const teamSession = sessions.find(session => session.teamId === team._id)!;
  const sessionTime = dayjs(teamSession.scheduledTime);

  const teamMatches = matches
    .filter(match => match.stage === 'ranking')
    .map(match => ({
      match,
      participantIndex: match.participants.findIndex(p => p.teamId === team._id)
    }))
    .filter(({ participantIndex }) => participantIndex !== -1);
  const matchTimes = teamMatches.map(({ match }) => dayjs(match.scheduledTime));

  return (
    <Stack sx={{ py: 2 }}>
      {/* <Typography>{team._id.toString()}</Typography> */}
      <Typography fontSize="1.25rem" fontWeight={500} gutterBottom>
        מידע כללי
      </Typography>
      <Grid container columnSpacing={1}>
        <EventWidget eventType="judging" event={teamSession} />
        {teamMatches.map(({ match }, index) => (
          <EventWidget key={index} eventType="match" event={match} />
        ))}
      </Grid>
      <Typography>שורה של כפתורים עם שעות</Typography>
      <Typography>כשבוחרים כפתור יהיה פה לוז של לפני בזמן אחרי של המקצה</Typography>
      <Typography>תהיה גם אזהרה כתומה אם זה צפוף עם השיפוט או אדומה אם זה בזמן שיפוא</Typography>
      <Typography>בלוז עצמו, לחיצה על שולחן תסמן אותו</Typography>
      <Typography> לבסוף, יהיה כתוב המשפט "קביעת מקצה חוזר בשעה X בשולחן Y"</Typography>
      <Typography>וכפתור אישור סופי שיאפס את כל הUI</Typography>
    </Stack>
  );
};

export default RematchScheduler;

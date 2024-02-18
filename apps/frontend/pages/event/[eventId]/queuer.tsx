import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import {
  Event,
  EventState,
  SafeUser,
  Team,
  RobotGameMatch,
  RobotGameTable,
  JudgingSession,
  JudgingRoom
} from '@lems/types';
import { useWebsocket } from '../../../hooks/use-websocket';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import QueuerFieldTeamDisplay from '../../../components/queueing/queuer-field-team-display';
import QueuerFieldSchedule from '../../../components/queueing/queuer-field-schedule';
import QueuerPitMap from '../../../components/queueing/queuer-pit-map';
import QueuerJudgingSchedule from '../../../components/queueing/queuer-judging-schedule';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles, localizedEventSection } from '../../../localization/roles';
import QueuerJudgingTeamDisplay from '../../../components/queueing/queuer-judging-team-display';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  pitMapUrl: string;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  teams: initialTeams,
  tables,
  rooms,
  matches: initialMatches,
  sessions: initialSessions,
  pitMapUrl
}) => {
  const NAVIGATION_HEIGHT = 60;
  const NAVIGATION_PADDING = 10;
  const router = useRouter();
  const [activeView, setActiveView] = useState(0);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);

  const handleMatchEvent = (match: WithId<RobotGameMatch>, newEventState?: WithId<EventState>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newEventState) setEventState(newEventState);
  };

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        }
        return t;
      })
    );
  };

  const handleSessionEvent = (
    session: WithId<JudgingSession>,
    newEventState?: WithId<EventState>
  ) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );

    if (newEventState) setEventState(newEventState);
  };

  useWebsocket(event._id.toString(), ['field', 'pit-admin', 'judging'], undefined, [
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchUpdated', handler: handleMatchEvent },
    { name: 'teamRegistered', handler: handleTeamRegistered },
    { name: 'judgingSessionStarted', handler: handleSessionEvent },
    { name: 'judgingSessionCompleted', handler: handleSessionEvent },
    { name: 'judgingSessionAborted', handler: handleSessionEvent },
    { name: 'judgingSessionUpdated', handler: handleSessionEvent }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['queuer']}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | מתחם ${localizedEventSection[user.roleAssociation?.value as string].name}`}
      >
        <Box sx={{ overflowY: 'auto', pb: `${NAVIGATION_HEIGHT + NAVIGATION_PADDING}px` }}>
          {activeView === 0 && (
            <>
              {user.roleAssociation?.value === 'field' && (
                <QueuerFieldTeamDisplay eventState={eventState} teams={teams} matches={matches} />
              )}
              {user.roleAssociation?.value === 'judging' && (
                <QueuerJudgingTeamDisplay teams={teams} sessions={sessions} rooms={rooms} />
              )}
            </>
          )}
          {activeView === 1 && <QueuerPitMap event={event} pitMapUrl={pitMapUrl} />}
          {activeView === 2 && (
            <>
              {user.roleAssociation?.value === 'field' && (
                <QueuerFieldSchedule
                  event={event}
                  matches={matches}
                  teams={teams}
                  tables={tables}
                />
              )}
              {user.roleAssociation?.value === 'judging' && (
                <QueuerJudgingSchedule
                  event={event}
                  rooms={rooms}
                  sessions={sessions}
                  teams={teams}
                />
              )}
            </>
          )}
        </Box>
        <BottomNavigation
          showLabels
          value={activeView}
          onChange={(event, newValue) => {
            setActiveView(newValue);
          }}
          sx={{ position: 'fixed', bottom: 0, right: 0, height: NAVIGATION_HEIGHT, width: '100vw' }}
        >
          <BottomNavigationAction label="בית" icon={<HomeRoundedIcon />} />
          <BottomNavigationAction label="מפת פיטים" icon={<MapRoundedIcon />} />
          <BottomNavigationAction label="לוח זמנים" icon={<EventNoteRoundedIcon />} />
        </BottomNavigation>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        teams: `/api/events/${user.eventId}/teams`,
        eventState: `/api/events/${user.eventId}/state`,
        tables: `/api/events/${user.eventId}/tables`,
        rooms: `/api/events/${user.eventId}/rooms`,
        sessions: `/api/events/${user.eventId}/sessions`,
        matches: `/api/events/${user.eventId}/matches`
      },
      ctx
    );

    const pitMapUrl = `https://${process.env.DIGITALOCEAN_SPACE}.${process.env.DIGITALOCEAN_ENDPOINT}/pit-maps`;

    return { props: { user, pitMapUrl, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import {
  Event,
  EventState,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Team,
  Ticket,
  RobotGameTable,
  RobotGameMatch
} from '@lems/types';
import Layout from '../../../components/layout';
import ReportLink from '../../../components/general/report-link';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import TicketPanel from '../../../components/general/ticket-panel';
import EventPanel from '../../../components/tournament-manager/event-panel';
import JudgingScheduleEditor from '../../../components/tournament-manager/judging-schedule-editor';
import FieldScheduleEditor from '../../../components/tournament-manager/field-schedule-editor';
import ConnectionIndicator from '../../../components/connection-indicator';
import CVForm from '../../../components/cv-form/cv-form';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedRoles } from '../../../localization/roles';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  tickets: Array<WithId<Ticket>>;
  rooms: Array<WithId<JudgingRoom>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  teams: initialTeams,
  tickets: initialTickets,
  rooms,
  tables,
  matches: initialMatches,
  sessions: initialSessions
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('1');
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [tickets, setTickets] = useState<Array<WithId<Ticket>>>(initialTickets);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        } else {
          return t;
        }
      })
    );
  };

  const handleTicketCreated = (ticket: WithId<Ticket>) => {
    setTickets(tickets => [...tickets, ticket]);
  };

  const handleTicketUpdated = (ticket: WithId<Ticket>) => {
    setTickets(tickets =>
      tickets.map(t => {
        if (t._id === ticket._id) {
          return ticket;
        } else {
          return t;
        }
      })
    );
  };

  const handleSessionEvent = (session: WithId<JudgingSession>) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );
  };

  const handleMatchEvent = (
    newMatch: WithId<RobotGameMatch>,
    newEventState?: WithId<EventState>
  ) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === newMatch._id) {
          return newMatch;
        }
        return m;
      })
    );
    if (newEventState) setEventState(newEventState);
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['pit-admin', 'field', 'judging'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      {
        name: 'ticketCreated',
        handler: ticket => {
          handleTicketCreated(ticket);
          enqueueSnackbar('נוצרה קריאה חדשה!', { variant: 'warning' });
        }
      },
      {
        name: 'ticketUpdated',
        handler: ticket => {
          handleTicketUpdated(ticket);
          enqueueSnackbar('עודכנה קריאה!', { variant: 'info' });
        }
      },
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="tournament-manager"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            <ReportLink event={event} />
          </Stack>
        }
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="קריאות" value="1" />
              <Tab label="אירוע" value="2" />
              <Tab label="זירה" value="3" />
              <Tab label="שיפוט" value="4" />
              <Tab label="טפסי CV" value="5" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <TicketPanel
              event={event}
              teams={teams}
              tickets={tickets}
              showClosed={true}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="2">
            <EventPanel />
          </TabPanel>
          <TabPanel value="3">
            <FieldScheduleEditor
              event={event}
              eventState={eventState}
              teams={teams}
              tables={tables}
              matches={matches}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="4">
            <JudgingScheduleEditor
              event={event}
              teams={teams}
              rooms={rooms}
              sessions={sessions}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="5">
            <CVForm user={user} event={event} socket={socket} />
          </TabPanel>
        </TabContext>
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
        eventState: `/api/events/${user.eventId}/state`,
        teams: `/api/events/${user.eventId}/teams`,
        tickets: `/api/events/${user.eventId}/tickets`,
        rooms: `/api/events/${user.eventId}/rooms`,
        tables: `/api/events/${user.eventId}/tables`,
        matches: `/api/events/${user.eventId}/matches`,
        sessions: `/api/events/${user.eventId}/sessions`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

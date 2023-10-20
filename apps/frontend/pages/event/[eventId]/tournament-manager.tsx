import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab } from '@mui/material';
import {
  Event,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Team,
  Ticket,
  RobotGameTable,
  RobotGameMatch
} from '@lems/types';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import TicketPanel from '../../../components/general/ticket-panel';
import EventPanel from '../../../components/tournament-manager/event-panel';
import AwardsPanel from '../../../components/tournament-manager/awards-panel';
import JudgingScheduleEditor from '../../../components/tournament-manager/judging-schedule-editor';
import FieldScheduleEditor from '../../../components/tournament-manager/field-schedule-editor';
import ConnectionIndicator from '../../../components/connection-indicator';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedRoles } from '../../../localization/roles';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
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
  teams: initialTeams,
  tickets: initialTickets,
  rooms,
  tables,
  matches: initialMatches,
  sessions: initialSessions
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('1');
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

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['pit-admin'],
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
      }
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
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="זירה" value="1" />
              <Tab label="שיפוט" value="2" />
              <Tab label="אירוע" value="3" />
              <Tab label="קריאות" value="4" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <FieldScheduleEditor teams={teams} tables={tables} matches={matches} />
          </TabPanel>
          <TabPanel value="2">
            <JudgingScheduleEditor teams={teams} rooms={rooms} sessions={sessions} />
          </TabPanel>
          <TabPanel value="3">
            <EventPanel />
          </TabPanel>
          <TabPanel value="4">
            <TicketPanel
              event={event}
              teams={teams}
              tickets={tickets}
              showClosed={true}
              socket={socket}
            />
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
        event: `/api/events/${user.event}`,
        teams: `/api/events/${user.event}/teams`,
        tickets: `/api/events/${user.event}/tickets`,
        rooms: `/api/events/${user.event}/rooms`,
        tables: `/api/events/${user.event}/tables`,
        matches: `/api/events/${user.event}/matches`,
        sessions: `/api/events/${user.event}/sessions`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

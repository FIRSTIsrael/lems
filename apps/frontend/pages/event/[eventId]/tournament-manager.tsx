import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab } from '@mui/material';
import { Event, SafeUser, Team, Ticket } from '@lems/types';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedRoles } from '../../../localization/roles';
import ConnectionIndicator from '../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import TicketPanel from '../../../components/general/ticket-panel';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  tickets: Array<WithId<Ticket>>;
}

const Page: NextPage<Props> = ({ user, event, teams: initialTeams, tickets: initialTickets }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('1');
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [tickets, setTickets] = useState<Array<WithId<Ticket>>>(initialTickets);

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
              <Tab label="פרסים" value="3" />
              <Tab label="אירוע" value="4" />
              <Tab label="קריאות" value="5" />
            </Tabs>
          </Paper>
          <TabPanel value="5">
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
        tickets: `/api/events/${user.event}/tickets`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

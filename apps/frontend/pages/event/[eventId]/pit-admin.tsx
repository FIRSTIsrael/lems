import { GetServerSideProps, NextPage } from 'next';
import router from 'next/router';
import { WithId } from 'mongodb';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Tabs, Tab, Paper } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/';
import { Event, Team, Ticket, User } from '@lems/types';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import TicketCreationPanel from '../../../components/pit-admin/ticket-creation-panel';
import TeamRegistrationPanel from '../../../components/pit-admin/team-registration-panel';
import TicketCard from '../../../components/pit-admin/ticket-card';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';

interface Props {
  user: User;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  tickets: Array<WithId<Ticket>>;
}

const Page: NextPage<Props> = ({ user, event, teams: initialTeams, tickets: initialTickets }) => {
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [tickets, setTickets] = useState<Array<WithId<Ticket>>>(initialTickets);
  const [activeTab, setActiveTab] = useState<string>('1');

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

  const handlerTicketUpdated = (ticket: WithId<Ticket>) => {
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

  const { connectionStatus, socket } = useWebsocket(
    event._id.toString(),
    ['pit-admin'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'ticketCreated', handler: handleTicketCreated },
      { name: 'ticketUpdated', handler: handlerTicketUpdated }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="pit-admin"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="רישום קבוצות" value="1" />
              <Tab label="פתיחת קריאות" value="2" />
              <Tab label="קריאות פתוחות" value="3" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            {teams && <TeamRegistrationPanel socket={socket} event={event} teams={teams} />}
          </TabPanel>
          <TabPanel value="2">
            {teams && <TicketCreationPanel socket={socket} event={event} teams={teams} />}
          </TabPanel>
          <TabPanel value="3">
            {tickets && (
              <Grid container columnGap={4} rowGap={2} justifyContent="center">
                {tickets
                  .filter(ticket => !ticket.closed)
                  .map(ticket => {
                    const team = teams.find(t => t._id === ticket.team) || ({} as WithId<Team>);
                    return (
                      <TicketCard
                        key={ticket._id.toString()}
                        event={event}
                        ticket={ticket}
                        team={team}
                        socket={socket}
                      />
                    );
                  })}
              </Grid>
            )}
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

import { GetServerSideProps, NextPage } from 'next';
import router from 'next/router';
import { WithId } from 'mongodb';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Tabs, Tab, Paper } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { DivisionWithEvent, Team, Ticket, SafeUser } from '@lems/types';
import Layout from '../../components/layout';
import { RoleAuthorizer } from '../../components/role-authorizer';
import TicketCreationPanel from '../../components/pit-admin/ticket-creation-panel';
import TeamRegistrationPanel from '../../components/pit-admin/team-registration-panel';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import TicketPanel from '../../components/general/ticket-panel';
import { localizeDivisionTitle } from '../../localization/event';
import { useQueryParam } from '../../hooks/use-query-param';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  teams: Array<WithId<Team>>;
  tickets: Array<WithId<Ticket>>;
}

const Page: NextPage<Props> = ({
  user,
  division: initialDivision,
  teams: initialTeams,
  tickets: initialTickets
}) => {
  const [division] = useState<WithId<DivisionWithEvent>>(initialDivision);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [tickets, setTickets] = useState<Array<WithId<Ticket>>>(initialTickets);
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');

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

  const { connectionStatus, socket } = useWebsocket(
    division._id.toString(),
    ['pit-admin'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'ticketCreated', handler: handleTicketCreated },
      { name: 'ticketUpdated', handler: handleTicketUpdated }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="pit-admin"
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        color={division.color}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="הגעת קבוצות" value="1" />
              <Tab label="פתיחת קריאות" value="2" />
              <Tab label="קריאות פתוחות" value="3" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <TeamRegistrationPanel socket={socket} division={division} teams={teams} />
          </TabPanel>
          <TabPanel value="2">
            <TicketCreationPanel socket={socket} division={division} teams={teams} />
          </TabPanel>
          <TabPanel value="3">
            <TicketPanel division={division} tickets={tickets} teams={teams} socket={socket} />
          </TabPanel>
        </TabContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`,
        tickets: `/api/divisions/${divisionId}/tickets`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

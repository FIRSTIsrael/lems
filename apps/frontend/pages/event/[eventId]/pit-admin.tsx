import { GetServerSideProps, NextPage } from 'next';
import router from 'next/router';
import { WithId } from 'mongodb';
import { useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { Tabs, Tab, Paper, Button, Autocomplete, TextField } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/';
import { Event, Team, User, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';

interface TeamRegistrationPanelProps {
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const TeamRegistrationPanel: React.FC<TeamRegistrationPanelProps> = ({ socket, event, teams }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  const unregisteredTeams = useMemo(
    () => (teams ? teams.filter((team: WithId<Team>) => !team.registered) : undefined),
    [teams]
  );

  const registerTeam = () => {
    team &&
      socket.emit('registerTeam', event._id.toString(), team?._id.toString(), response => {
        if (response.ok) {
          setTeam(null);
          setInputValue('');
          enqueueSnackbar('הקבוצה נרשמה בהצלחה!', { variant: 'success' });
        }
      });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container direction="row" alignItems="center" spacing={4}>
        <Grid xs={9}>
          {unregisteredTeams && (
            <Autocomplete
              freeSolo
              options={unregisteredTeams ? unregisteredTeams : []}
              getOptionLabel={team =>
                typeof team === 'string'
                  ? team
                  : `קבוצה #${team.number}, ${team.name} - ${team.affiliation.institution}, ${team.affiliation.city}`
              }
              inputMode="search"
              inputValue={inputValue}
              onInputChange={(_e, newInputValue) => setInputValue(newInputValue)}
              onChange={(_e, value) => typeof value !== 'string' && setTeam(value)}
              renderInput={params => <TextField {...params} label="קבוצה" />}
            />
          )}
        </Grid>
        <Grid xs={3}>
          <Button
            sx={{ borderRadius: 8 }}
            variant="contained"
            disabled={!team}
            fullWidth
            onClick={registerTeam}
          >
            רישום
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

interface Props {
  user: User;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const [teams, setTeams] = useState<Array<WithId<Team>> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('1');

  const updateTeams = () => {
    apiFetch(`/api/events/${user.event}/teams`)
      .then(res => res?.json())
      .then(data => {
        setTeams(data);
      });
  };

  const { connectionStatus, socket } = useWebsocket(
    event._id.toString(),
    ['pit-admin'],
    updateTeams,
    [{ name: 'teamRegistered', handler: updateTeams }]
  );

  return (
    <RoleAuthorizer user={user} allowedRoles="pit-admin" onFail={() => router.back()}>
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
              <Tab label="פתיחת בקשות" value="2" />
            </Tabs>
          </Paper>
          {teams && (
            <TabPanel value="1">
              <TeamRegistrationPanel socket={socket} event={event} teams={teams} />
            </TabPanel>
          )}
          <TabPanel value="2">שלום לכם</TabPanel>
        </TabContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
    const event = await apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    return { props: { user, event } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

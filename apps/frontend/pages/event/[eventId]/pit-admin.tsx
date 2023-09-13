import { apiFetch } from '../../../lib/utils/fetch';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { localizeRole } from '../../../lib/utils/localization';
import { GetServerSideProps, NextPage } from 'next';
import router from 'next/router';
import { Event, Team, User } from '@lems/types';
import { useWebsocket } from '../../../hooks/use-websocket';
import { ObjectId, WithId } from 'mongodb';
import { useMemo, useState } from 'react';
import {
  Tabs,
  Tab,
  Paper,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Typography,
  Button
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/';

interface Props {
  user: User;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const [chosenTeamId, setChosenTeamId] = useState<string>('');
  const [teams, setTeams] = useState<Array<WithId<Team>> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('1');

  const unregisteredTeams = useMemo(
    () => (teams ? teams.filter((team: WithId<Team>) => !team.registered) : undefined),
    [teams]
  );

  const chosenTeam = useMemo(
    () =>
      unregisteredTeams
        ? unregisteredTeams.find(team => team._id.toString() === chosenTeamId)
        : undefined,
    [unregisteredTeams, chosenTeamId]
  );

  const registerTeam = () => {
    socket.emit('registerTeam', event._id.toString(), chosenTeamId, response => {
      if (response.ok) setChosenTeamId('');
    });
  };

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
    [{ name: 'registerTeam', handler: updateTeams }]
  );

  return (
    <RoleAuthorizer user={user} allowedRoles="pit-admin" onFail={() => router.back()}>
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizeRole(user.role).name} | ${event.name}`}
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
          <TabPanel value="1">
            <Paper sx={{ mt: 4, p: 4 }}>
              <Grid container direction="row" alignItems="center" spacing={4}>
                <Grid xs={9}>
                  <FormControl fullWidth>
                    <InputLabel id="team-select-label">קבוצה</InputLabel>
                    <Select
                      labelId="team-select-label"
                      id="team-select"
                      value={chosenTeamId}
                      label="קבוצה"
                      onChange={e => setChosenTeamId(e.target.value)}
                    >
                      {unregisteredTeams &&
                        unregisteredTeams.map(team => (
                          <MenuItem key={team._id.toString()} value={team._id.toString()}>
                            קבוצה #{team.number}, {team.name} - {team.affiliation.institution},{' '}
                            {team.affiliation.city}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={3}>
                  <Button
                    sx={{ borderRadius: 8 }}
                    variant="contained"
                    disabled={!chosenTeam}
                    fullWidth
                    onClick={registerTeam}
                  >
                    רישום
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
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

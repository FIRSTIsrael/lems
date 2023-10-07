import { GetServerSideProps, NextPage } from 'next';
import router from 'next/router';
import { WithId } from 'mongodb';
import React, { useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import {
  Tabs,
  Tab,
  Paper,
  Button,
  Autocomplete,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import {
  Event,
  Team,
  TicketType,
  TicketTypes,
  User,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedTicketTypes } from '../../../localization/tickets';
import { localizeTeam } from '../../../localization/teams';

interface TeamSelectionProps {
  teams: WithId<Team>[] | undefined;
  setTeam: (team: WithId<Team> | null) => void;
  inputValue: string;
  setInputValue: (newValue: string) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  teams,
  setTeam,
  inputValue,
  setInputValue
}) => {
  return (
    <Autocomplete
      freeSolo
      options={teams ? teams : []}
      getOptionLabel={team => (typeof team === 'string' ? team : localizeTeam(team))}
      inputMode="search"
      inputValue={inputValue}
      onInputChange={(_e, newInputValue) => setInputValue(newInputValue)}
      onChange={(_e, value) => typeof value !== 'string' && setTeam(value)}
      renderInput={params => <TextField {...params} label="קבוצה" />}
    />
  );
};

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
            <TeamSelection
              teams={unregisteredTeams}
              setTeam={setTeam}
              inputValue={inputValue}
              setInputValue={setInputValue}
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

interface TicketCreationPanel {
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const TicketCreationPanel: React.FC<TicketCreationPanel> = ({ socket, event, teams }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [type, setType] = useState<TicketType>('general');

  const createTicket = () => {
    team &&
      socket.emit(
        'createTicket',
        event._id.toString(),
        team?._id.toString(),
        content,
        type,
        response => {
          if (response.ok) {
            setTeam(null);
            setInputValue('');
            setContent('');
            setType('general');
            enqueueSnackbar('הבקשה נשלחה בהצלחה!', { variant: 'success' });
          }
        }
      );
  };

  return (
    <Paper sx={{ p: 4 }}>
      {teams && (
        <Stack spacing={2}>
          <TeamSelection
            teams={teams}
            setTeam={setTeam}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
          <TextField
            label="תוכן הבקשה"
            value={content}
            onChange={e => setContent(e.target.value)}
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel id="type-select-label">סוג הבקשה</InputLabel>
            <Select
              labelId="type-select-label"
              label="סוג הבקשה"
              value={type}
              onChange={e => setType(e.target.value as TicketType)}
            >
              {TicketTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {localizedTicketTypes[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box justifyContent="flex-end" display="flex" pt={2}>
            <Button
              sx={{ borderRadius: 8 }}
              variant="contained"
              disabled={!team || !content || !type}
              onClick={createTicket}
              endIcon={<CreateOutlinedIcon />}
            >
              פתיחת הבקשה
            </Button>
          </Box>
        </Stack>
      )}
    </Paper>
  );
};

interface Props {
  user: User;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, teams: initialTeams }) => {
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
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

  const { connectionStatus, socket } = useWebsocket(
    event._id.toString(),
    ['pit-admin'],
    undefined,
    [{ name: 'teamRegistered', handler: handleTeamRegistered }]
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
              <Tab label="פתיחת קריאות" value="2" />
            </Tabs>
          </Paper>
          {teams && (
            <TabPanel value="1">
              <TeamRegistrationPanel socket={socket} event={event} teams={teams} />
            </TabPanel>
          )}
          <TabPanel value="2">
            {teams && <TicketCreationPanel socket={socket} event={event} teams={teams} />}
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
        teams: `/api/events/${user.event}/teams`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

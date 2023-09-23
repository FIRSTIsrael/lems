import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import {
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  Event,
  Team,
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  EventState,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import Timer from '../../../components/referee/timer';
import DoneCard from '../../../components/referee/done-card';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizeTeam } from '../../../localization/teams';
import { enqueueSnackbar } from 'notistack';
import { getDivisionColor, getDivisionBackground } from 'apps/frontend/lib/utils/colors';
import { stringifyTwoDates } from 'apps/frontend/lib/utils/dayjs';

interface ReadyCheckProps {
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  team: WithId<Team>;
  match: WithId<RobotGameMatch>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ReadyCheck: React.FC<ReadyCheckProps> = ({ event, table, team, match, socket }) => {
  const handleReadyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    match &&
      socket.emit(
        'updateMatch',
        event._id.toString(),
        table._id.toString(),
        match._id.toString(),
        { ready: e.target.checked },
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון הסטטוס נכשל.', { variant: 'error' });
          }
        }
      );
  };
  const handleStart = () => {
    match &&
      socket.emit(
        'startMatch',
        event._id.toString(),
        table._id.toString(),
        match._id.toString(),
        response => {
          // { ok: true }
        }
      );
  };

  return (
    <Paper sx={{ transform: 'translateY(100%)', mt: 4, p: 4 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h1">{localizeTeam(team)}</Typography>
        <Typography variant="h3" fontSize="2rem" color="gray">
          המקצה הבא יתחיל בשעה {dayjs(match.time).format('HH:mm')}
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={match.ready} onChange={handleReadyChange} />}
          label={<Typography variant="h4">הקבוצה ואנחנו מוכנים למקצה!</Typography>}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 35 } }}
        />
        <Button onClick={handleStart}>Click me!</Button>
      </Stack>
    </Paper>
  );
};

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, table, teams }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);

  const fetchMatches = useCallback(() => {
    apiFetch(`/api/events/${user.event}/tables/${table._id}/matches`)
      .then(res => res.json())
      .then(data => {
        setMatches(data);
      });
  }, [table._id, user.event]);

  const fetchInitialData = () => {
    apiFetch(`/api/events/${user.event}/state`)
      .then(res => res.json())
      .then(data => {
        setEventState(data);
      });

    fetchMatches();
  };

  const handleMatchLoaded = (matchNumber: number) => {
    setEventState(prev => (prev ? { ...prev, loadedMatch: matchNumber } : prev));
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], fetchInitialData, [
    { name: 'matchLoaded', handler: handleMatchLoaded },
    { name: 'matchStarted', handler: fetchMatches },
    { name: 'matchUpdated', handler: fetchMatches }
  ]);

  const activeMatches = matches?.filter(
    m =>
      m.status === 'in-progress' || m.status === 'scoring' || m.number === eventState?.loadedMatch
  );

  return (
    <RoleAuthorizer user={user} allowedRoles="referee" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <Paper sx={{ p: 4, my: 6 }}>
          <List>
            {matches?.map(match => (
              <ListItemButton key={match._id.toString()} sx={{ borderRadius: 2 }} component="a">
                <ListItemText
                  primary={`מקצה ${match.number}`}
                  secondary={`${match.team?.affiliation.name}, ${match.team?.affiliation.city}`}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    const tablePromise = apiFetch(
      `/api/events/${user.event}/tables/${user.roleAssociation.value}`,
      undefined,
      ctx
    ).then(res => res?.json());

    const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
      res?.json()
    );

    const [table, event, teams] = await Promise.all([tablePromise, eventPromise, teamsPromise]);

    return { props: { user, event, table, teams } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

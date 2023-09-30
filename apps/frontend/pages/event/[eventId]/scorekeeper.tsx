import { useState, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Paper, Stack } from '@mui/material';
import { Event, Team, SafeUser, RobotGameMatch, EventState } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import ActiveMatch from '../../../components/field/scorekeeper/active-match';
import Schedule from '../../../components/field/scorekeeper/schedule';
import ControlActions from '../../../components/field/scorekeeper/control-actions';
import Layout from '../../../components/layout';
import { apiFetch } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);

  const fetchMatches = useCallback(() => {
    apiFetch(`/api/events/${user.event}/matches`)
      .then(res => res.json())
      .then(data => {
        setMatches(data);
      });
  }, [user.event]);

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
  const handleMatchStarted = (data: { matchNumber: number; startedAt: number }) => {
    setEventState(prev =>
      prev
        ? {
            ...prev,
            activeMatch: data.matchNumber,
            loadedMatch: null
          }
        : prev
    );
  };
  const matchCompleted = (matchNumber: number) => {
    setEventState(prev => (prev ? { ...prev, activeMatch: null } : prev));
  };
  const matchAborted = (matchNumber: number) => {
    setEventState(prev => (prev ? { ...prev, activeMatch: null } : prev));
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field'],
    fetchInitialData,
    [
      { name: 'matchLoaded', handler: handleMatchLoaded },
      { name: 'matchStarted', handler: handleMatchStarted },
      { name: 'matchCompleted', handler: matchCompleted },
      { name: 'matchAborted', handler: matchAborted },
      { name: 'matchSubmitted', handler: fetchMatches }
    ]
  );

  const nextMatchNumber = matches?.find(match => match.status === 'not-started')?.number;

  return (
    <RoleAuthorizer user={user} allowedRoles="scorekeeper" onFail={() => router.back()}>
      <Layout
        title={`בקרה | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <Stack
          sx={{
            height: 'calc(100vh - 56px)',
            overflow: 'hidden'
          }}
        >
          <Stack direction="row" spacing={2} my={4}>
            <ActiveMatch
              title="מקצה רץ"
              match={
                matches?.find(match => match.number === eventState?.activeMatch) ||
                ({} as WithId<RobotGameMatch>)
              }
              startTime={
                matches?.find(match => match.number === eventState?.activeMatch)?.startTime
              }
            />
            <ActiveMatch
              title="המקצה הבא"
              match={
                matches?.find(match => match.number === eventState?.loadedMatch) ||
                ({} as WithId<RobotGameMatch>)
              }
            />
          </Stack>

          <ControlActions
            eventId={event._id.toString()}
            nextMatchNumber={nextMatchNumber}
            loadedMatchNumber={eventState?.loadedMatch || undefined}
            activeMatchNumber={eventState?.activeMatch || undefined}
            socket={socket}
          />

          <Paper sx={{ p: 4, my: 6 }}>
            <Schedule eventId={event._id.toString()} matches={matches || []} socket={socket} />
          </Paper>
        </Stack>
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

import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Paper, Stack } from '@mui/material';
import { Event, SafeUser, RobotGameMatch, EventState } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import ActiveMatch from '../../../components/field/scorekeeper/active-match';
import Schedule from '../../../components/field/scorekeeper/schedule';
import ControlActions from '../../../components/field/scorekeeper/control-actions';
import Layout from '../../../components/layout';
import { apiFetch } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedRoles } from '../../../localization/roles';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);

  const handleMatchEvent = (
    newMatch: WithId<RobotGameMatch>,
    newEventState: WithId<EventState>
  ) => {
    setEventState(newEventState);
    setMatches(matches =>
      matches.map(m => {
        if (m._id === newMatch._id) {
          return newMatch;
        }
        return m;
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchAborted', handler: handleMatchEvent }
  ]);

  const nextMatchId = matches?.find(match => match.status === 'not-started')?._id;

  return (
    <RoleAuthorizer user={user} allowedRoles="scorekeeper" onFail={() => router.back()}>
      <Layout
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
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
                matches?.find(match => match._id === eventState.activeMatch) ||
                ({} as WithId<RobotGameMatch>)
              }
              startTime={matches?.find(match => match._id === eventState.activeMatch)?.startTime}
            />
            <ActiveMatch
              title="המקצה הבא"
              match={
                matches?.find(match => match._id === eventState.loadedMatch) ||
                ({} as WithId<RobotGameMatch>)
              }
            />
          </Stack>

          <ControlActions
            eventId={event._id.toString()}
            nextMatchId={nextMatchId}
            loadedMatchId={eventState.loadedMatch || undefined}
            activeMatchId={eventState.activeMatch || undefined}
            socket={socket}
          />

          <Paper sx={{ px: 4, py: 1, my: 4, overflowY: 'scroll' }}>
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

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );

    const eventStatePromise = apiFetch(`/api/events/${user.event}/state`, undefined, ctx).then(
      res => res?.json()
    );
    const matchesPromise = apiFetch(`/api/events/${user.event}/matches`, undefined, ctx).then(res =>
      res.json()
    );

    const [event, eventState, matches] = await Promise.all([
      eventPromise,
      eventStatePromise,
      matchesPromise
    ]);

    return { props: { user, event, eventState, matches } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

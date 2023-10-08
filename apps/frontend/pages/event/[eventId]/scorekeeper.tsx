import { useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { Paper, Stack } from '@mui/material';
import { Event, SafeUser, RobotGameMatch, EventState } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import ActiveMatch from '../../../components/field/scorekeeper/active-match';
import Schedule from '../../../components/field/scorekeeper/schedule';
import ControlActions from '../../../components/field/scorekeeper/control-actions';
import Layout from '../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedRoles } from '../../../localization/roles';
import { enqueueSnackbar } from 'notistack';

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
  const [nextMatchId, setNextMatchId] = useState<ObjectId | undefined>(
    matches?.find(match => match.status === 'not-started' && match.type !== 'test')?._id
  );

  const activeMatch = useMemo(
    () =>
      matches.find(match => match._id === eventState.activeMatch) || ({} as WithId<RobotGameMatch>),
    [eventState.activeMatch, matches]
  );
  const loadedMatch = useMemo(
    () =>
      matches.find(match => match._id === eventState.loadedMatch) || ({} as WithId<RobotGameMatch>),
    [eventState.loadedMatch, matches]
  );

  const handleMatchEvent = (match: WithId<RobotGameMatch>, eventState?: WithId<EventState>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (eventState) setEventState(eventState);
  };

  const handleMatchStarted = (
    newMatch: WithId<RobotGameMatch>,
    newEventState: WithId<EventState>
  ) => {
    handleMatchEvent(newMatch, newEventState);
    const newNextMatchId = matches?.find(
      match => match.status === 'not-started' && match._id != newMatch._id
    )?._id;
    console.log(newMatch);
    if (newEventState.loadedMatch === null && newMatch.type !== 'test') {
      setNextMatchId(newNextMatchId);
      if (newNextMatchId)
        socket.emit('loadMatch', event._id.toString(), newNextMatchId.toString(), response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
          }
        });
    }
  };

  const handleMatchAborted = (
    newMatch: WithId<RobotGameMatch>,
    newEventState: WithId<EventState>
  ) => {
    handleMatchEvent(newMatch, newEventState);
    if (newMatch.type !== 'test') {
      setNextMatchId(newMatch._id);
      socket.emit('loadMatch', event._id.toString(), newMatch._id.toString(), response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
        }
      });
    }
  };

  const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchStarted', handler: handleMatchStarted },
    { name: 'matchAborted', handler: handleMatchAborted },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchParticipantPrestarted', handler: handleMatchEvent }
  ]);

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
            <ActiveMatch title="מקצה רץ" match={activeMatch} startTime={activeMatch?.startTime} />
            <ActiveMatch
              title="המקצה הבא"
              match={
                matches.find(match => match._id === eventState.loadedMatch) ||
                ({} as WithId<RobotGameMatch>)
              }
            />
          </Stack>

          <ControlActions
            eventId={event._id.toString()}
            nextMatchId={nextMatchId}
            loadedMatch={loadedMatch}
            activeMatchId={activeMatch._id}
            socket={socket}
          />

          <Paper sx={{ px: 4, py: 1, my: 4, overflowY: 'scroll' }}>
            <Schedule
              eventId={event._id.toString()}
              matches={matches.filter(m => m.type !== 'test') || []}
              socket={socket}
            />
          </Paper>
        </Stack>
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
        eventState: `/api/events/${user.event}/state`,
        matches: `/api/events/${user.event}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

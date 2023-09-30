import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Event,
  SafeUser,
  RobotGameMatch,
  RobotGameTable,
  EventState,
  ALLOW_MATCH_SELECTOR
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch } from '../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../hooks/use-websocket';
import MatchSelector from '../../../../components/field/referee/match-selector';
import StrictRefereeDisplay from '../../../../components/field/referee/strict-referee-display';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  table,
  eventState: initialEventState,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
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
    { name: 'matchAborted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent }
  ]);

  return (
    <RoleAuthorizer user={user} allowedRoles="referee" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`שולחן ${table.name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {ALLOW_MATCH_SELECTOR ? (
          <MatchSelector event={event} eventState={eventState} table={table} matches={matches} />
        ) : (
          <StrictRefereeDisplay
            event={event}
            eventState={eventState}
            table={table}
            matches={matches}
            socket={socket}
          />
        )}
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

    const eventStatePromise = apiFetch(`/api/events/${user.event}/state`, undefined, ctx).then(
      res => res?.json()
    );
    const matchesPromise = apiFetch(
      `/api/events/${user.event}/tables/${user.roleAssociation.value}/matches`,
      undefined,
      ctx
    ).then(res => res.json());

    const [table, event, eventState, matches] = await Promise.all([
      tablePromise,
      eventPromise,
      eventStatePromise,
      matchesPromise
    ]);

    console.log(matches);

    return { props: { user, event, table, eventState, matches } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

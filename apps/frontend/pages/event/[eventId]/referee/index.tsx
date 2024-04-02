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
  Team,
  ALLOW_MATCH_SELECTOR
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../hooks/use-websocket';
import MatchSelector from '../../../../components/field/referee/match-selector';
import StrictRefereeDisplay from '../../../../components/field/referee/strict-referee-display';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  table: WithId<RobotGameTable>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  table,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);

  const updateMatches = (newMatch: WithId<RobotGameMatch>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === newMatch._id) {
          return newMatch;
        }
        return m;
      })
    );
  };

  const handleMatchEvent = (
    newMatch: WithId<RobotGameMatch>,
    newEventState?: WithId<EventState>
  ) => {
    updateMatches(newMatch);
    if (newEventState) setEventState(newEventState);
  };

  const handleTeamRegistered = (team: WithId<Team>) => {
    setMatches(matches =>
      matches.map(m => {
        const teamIndex = m.participants
          .filter(p => p.teamId)
          .findIndex(p => p.teamId === team._id);
        if (teamIndex !== -1) {
          const newMatch = structuredClone(m);
          newMatch.participants[teamIndex].team = team;
          return newMatch;
        }
        return m;
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'pit-admin'],
    undefined,
    [
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: updateMatches },
      { name: 'teamRegistered', handler: handleTeamRegistered }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="referee"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`שולחן ${table.name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={event.color}
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

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        eventState: `/api/events/${user.eventId}/state`,
        table: `/api/events/${user.eventId}/tables/${user.roleAssociation.value}`,
        matches: `/api/events/${user.eventId}/tables/${user.roleAssociation.value}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

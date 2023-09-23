import { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Event, Team, SafeUser, RobotGameMatch, RobotGameTable } from '@lems/types';
import { RoleAuthorizer } from '../../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../../components/connection-indicator';
import Layout from '../../../../../components/layout';
import MatchPrestart from '../../../../../components/field/referee/prestart';
import WaitForMatchStart from '../../../../../components/field/referee/wait-for-start';
import { apiFetch } from '../../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../../localization/roles';
import { useWebsocket } from '../../../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  match: WithId<RobotGameMatch>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, table, match: initialMatch }) => {
  const router = useRouter();
  const [match, setMatch] = useState<WithId<RobotGameMatch>>(initialMatch);

  const fetchMatchData = () =>
    apiFetch(`/api/events/${user.event}/matches/${match._id}`)
      .then(res => res.json())
      .then(setMatch);

  const handleMatchStarted = (matchNumber: number) => {
    if (matchNumber === match.number) {
      fetchMatchData();

      // Fast update
      setMatch(match => ({ ...match, status: 'in-progress' }));
    }
  };

  const handleMatchUpdated = (matchId: string) => {
    if (matchId === match._id.toString()) {
      fetchMatchData();
    }
  };

  const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'matchStarted', handler: handleMatchStarted },
    { name: 'matchUpdated', handler: handleMatchUpdated }
  ]);

  const updateMatch = useCallback(
    (updatedMatch: Partial<RobotGameMatch>) => {
      setMatch(match => ({ ...match, ...updatedMatch }));
      socket.emit(
        'updateMatch',
        match.eventId.toString(),
        match._id.toString(),
        updatedMatch,
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [match._id, match.eventId, socket]
  );

  useEffect(() => {
    if (!match.team?.registered) {
      setMatch(match => ({ ...match, present: 'no-show' }));
    }
  }, [match.team?.registered]);

  return (
    <RoleAuthorizer user={user} allowedRoles="referee" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {!match?.ready && <MatchPrestart match={match} updateMatch={updateMatch} />}
        {match?.ready && <WaitForMatchStart match={match} updateMatch={updateMatch} />}
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

    const matchPromise = apiFetch(
      `/api/events/${user.event}/matches/${ctx.params?.matchId}
    `,
      undefined,
      ctx
    ).then(res => res?.json());

    const [table, event, match] = await Promise.all([tablePromise, eventPromise, matchPromise]);

    return { props: { user, event, table, match } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

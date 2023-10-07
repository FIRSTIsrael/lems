import { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Event,
  SafeUser,
  RobotGameMatch,
  RobotGameMatchParticipant,
  RobotGameTable,
  ALLOW_MATCH_SELECTOR
} from '@lems/types';
import { RoleAuthorizer } from '../../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../../components/connection-indicator';
import Layout from '../../../../../components/layout';
import MatchPrestart from '../../../../../components/field/referee/prestart';
import WaitForMatchStart from '../../../../../components/field/referee/wait-for-start';
import Timer from '../../../../../components/field/referee/timer';
import { apiFetch, serverSideGetRequests } from '../../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

// TODO: This page needs to be tested and implemented in a future release

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  match: WithId<RobotGameMatch>;
}

const Page: NextPage<Props> = ({ user, event, table, match: initialMatch }) => {
  // const router = useRouter();
  // const [match, setMatch] = useState<WithId<RobotGameMatch>>(initialMatch);
  // const participant = match.participants.find(p => p.tableId === table._id);

  // const fetchMatchData = () =>
  //   apiFetch(`/api/events/${user.event}/matches/${match._id}`)
  //     .then(res => res.json())
  //     .then(setMatch);

  // const handleMatchStarted = (data: { matchNumber: number; startedAt: number }) => {
  //   if (data.matchNumber !== match.number) return;
  //   setMatch(match => ({
  //     ...match,
  //     status: 'in-progress',
  //     startTime: new Date(data.startedAt)
  //   }));
  // };

  // const handleMatchAborted = (matchNumber: number) => {
  //   if (matchNumber !== match.number) return;
  //   setMatch(match => ({
  //     ...match,
  //     status: 'not-started',
  //     startTime: undefined
  //   }));
  // };

  // const handleMatchUpdated = (matchId: string) => {
  //   if (matchId === match._id.toString()) {
  //     fetchMatchData();
  //   }
  // };

  // const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
  //   { name: 'matchStarted', handler: handleMatchStarted },
  //   { name: 'matchAborted', handler: handleMatchAborted },
  //   { name: 'matchUpdated', handler: handleMatchUpdated }
  // ]);

  // const updateMatchParticipant = useCallback(
  //   (updatedMatchParticipant: Partial<RobotGameMatchParticipant>) => {
  //     const participantIndex = match.participants.findIndex(p => p.tableId === table._id);
  //     if (participantIndex !== -1) {
  //       const updatedMatch = { ...match };
  //       updatedMatch.participants[participantIndex] = {
  //         ...updatedMatch.participants[participantIndex],
  //         ...updatedMatchParticipant
  //       };
  //       socket.emit(
  //         'updateMatch',
  //         match.eventId.toString(),
  //         match._id.toString(),
  //         updatedMatch,
  //         response => {
  //           if (!response.ok) {
  //             enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
  //           }
  //         }
  //       );
  //     }
  //   },
  //   [match, socket, table._id]
  // );

  // useEffect(() => {
  //   if (participant) {
  //     if (!participant.team?.registered) {
  //       updateMatchParticipant({ present: 'no-show' });
  //     }
  //   }
  // }, [participant, updateMatchParticipant]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="referee"
      // onFail={() => router.back()}
    >
      <Layout
        maxWidth={800}
        title={`שולחן ${table.name} | ${event.name}`}
        // error={connectionStatus === 'disconnected'}
        // action={<ConnectionIndicator status={connectionStatus} />}
      >
        {/* {participant &&
          (match.status === 'in-progress' ? (
            <Timer participant={participant} match={match} />
          ) : participant.ready ? (
            <WaitForMatchStart
              participant={participant}
              match={match}
              updateMatchParticipant={updateMatchParticipant}
            />
          ) : (
            <MatchPrestart
              participant={participant}
              match={match}
              updateMatchParticipant={updateMatchParticipant}
            />
          ))} */}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    if (!ALLOW_MATCH_SELECTOR)
      return {
        redirect: { destination: `/event/${ctx.params?.eventId}/${user.role}`, permanent: false }
      };

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.event}`,
        table: `/api/events/${user.event}/tables/${user.roleAssociation.value}`,
        match: `/api/events/${user.event}/matches/${ctx.params?.matchId}`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

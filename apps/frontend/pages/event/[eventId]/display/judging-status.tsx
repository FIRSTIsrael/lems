import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Event,
  Team,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  ConnectionStatus,
  EventState
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import JudgingStatusTable from '../../../../components/display/displays/judging-status-table';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizeRole } from '../../../../lib/utils/localization';
import { judgingSocket } from '../../../../lib/utils/websocket';

interface Props {
  user: WithId<SafeUser>;
  teams: Array<WithId<Team>>;
  event: WithId<Event>;
  rooms: Array<WithId<JudgingRoom>>;
}

const Page: NextPage<Props> = ({ user, teams, event, rooms }) => {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    judgingSocket.connected ? 'connected' : 'disconnected'
  );
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>([]);
  const [eventState, setEventState] = useState<WithId<EventState>>({} as WithId<EventState>);

  const updateSessions = (): Promise<Array<WithId<JudgingSession>>> => {
    return apiFetch(`/api/events/${user.event}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
        return data;
      });
  };

  const updateEventState = (): Promise<WithId<Event>> => {
    return apiFetch(`/api/events/${user.event}/state`)
      .then(res => res?.json())
      .then(data => {
        setEventState(data);
        return data;
      });
  };

  const updateData = () => {
    return Promise.all([updateSessions, updateEventState]);
  };

  useEffect(() => {
    judgingSocket.connect();
    setConnectionStatus('connecting');

    apiFetch(`/api/events/${user.event}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
      });

    apiFetch(`/api/events/${user.event}/state`)
      .then(res => res?.json())
      .then(data => {
        setEventState(data);
      });

    const onConnect = () => {
      setConnectionStatus('connected');
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    judgingSocket.on('connect', onConnect);
    judgingSocket.on('disconnect', onDisconnect);
    judgingSocket.on('sessionStarted', updateData);
    judgingSocket.on('sessionCompleted', updateData);
    judgingSocket.on('sessionAborted', updateData);

    return () => {
      judgingSocket.off('connect', onConnect);
      judgingSocket.off('disconnect', onDisconnect);
      judgingSocket.off('sessionStarted', updateData);
      judgingSocket.off('sessionCompleted', updateData);
      judgingSocket.off('sessionAborted', updateData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['display', 'head-referee']}
      onFail={() => router.back()}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizeRole(user.role).name} - מצב השיפוט | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {/* TODO: this does not re-render on websocket changes. Needs checking out.*/}
        <JudgingStatusTable
          sessions={sessions}
          eventState={eventState}
          rooms={rooms}
          teams={teams}
        />
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
    const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
      res?.json()
    );
    const roomsPromise = apiFetch(`/api/events/${user.event}/rooms`, undefined, ctx).then(res =>
      res?.json()
    );
    const [teams, rooms, event] = await Promise.all([teamsPromise, roomsPromise, eventPromise]);

    return { props: { user, teams, event, rooms } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

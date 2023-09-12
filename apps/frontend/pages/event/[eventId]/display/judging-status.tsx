import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Event, Team, JudgingRoom, JudgingSession, SafeUser, EventState } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import JudgingStatusTable from '../../../../components/display/displays/judging-status-table';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizeRole } from '../../../../lib/utils/localization';
import { useWebsocket } from '../../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  rooms: Array<WithId<JudgingRoom>>;
}

const Page: NextPage<Props> = ({ user, event, rooms }) => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>([]);
  const [teams, setTeams] = useState<Array<WithId<Team>>>([]);
  const [eventState, setEventState] = useState<WithId<EventState>>({} as WithId<EventState>);

  const updateSessions = () => {
    apiFetch(`/api/events/${user.event}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
      });
  };

  const updateTeams = () => {
    apiFetch(`/api/events/${user.event}/teams`)
      .then(res => res?.json())
      .then(data => {
        setTeams(data);
      });
  };

  const updateEventState = () => {
    apiFetch(`/api/events/${user.event}/state`)
      .then(res => res?.json())
      .then(data => {
        setEventState(data);
      });
  };

  const updateData = () => {
    updateSessions();
    updateTeams();
    updateEventState();
  };

  const onSessionUpdate = () => {
    updateSessions();
    updateEventState();
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['judging'], updateData, [
    { name: 'judgingSessionStarted', handler: onSessionUpdate },
    { name: 'judgingSessionCompleted', handler: onSessionUpdate },
    { name: 'judgingSessionAborted', handler: onSessionUpdate }
  ]);

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

    const roomsPromise = apiFetch(`/api/events/${user.event}/rooms`, undefined, ctx).then(res =>
      res?.json()
    );
    const [rooms, event] = await Promise.all([roomsPromise, eventPromise]);

    return { props: { user, event, rooms } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

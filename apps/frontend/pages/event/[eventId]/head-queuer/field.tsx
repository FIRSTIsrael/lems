import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Stack, Paper } from '@mui/material';
import { Event, EventState, SafeUser, Team, RobotGameMatch, RobotGameTable } from '@lems/types';
import { useWebsocket } from '../../../../hooks/use-websocket';
import ConnectionIndicator from '../../../../components/connection-indicator';
import ReportLink from '../../../../components/general/report-link';
import ActiveMatch from '../../../../components/field/scorekeeper/active-match';
import Layout from '../../../../components/layout';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import HeadQueueSchedule from '../../../../components/queueing/field/head-queue-schedule';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  teams: initialTeams,
  tables,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);

  const handleMatchEvent = (match: WithId<RobotGameMatch>, newEventState?: WithId<EventState>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newEventState) setEventState(newEventState);
  };

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        }
        return t;
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'audience-display'],
    undefined,
    [
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent },
      { name: 'audienceDisplayUpdated', handler: setEventState },
      { name: 'presentationUpdated', handler: setEventState },
      { name: 'teamRegistered', handler: handleTeamRegistered }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['head-queuer']}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | מתחם זירה`}
        error={connectionStatus === 'disconnected'}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            <ReportLink event={event} />
          </Stack>
        }
      >
        <Stack direction="row" spacing={2} my={2}>
          <ActiveMatch
            title="המקצה הבא"
            match={matches.find(match => match._id === eventState.loadedMatch) || null}
            showDelay={true}
          />
        </Stack>
        <Paper>
          <HeadQueueSchedule
            eventId={event._id}
            eventState={eventState}
            teams={teams}
            tables={tables}
            matches={matches.filter(m => m.stage !== 'test') || []}
            socket={socket}
          />
        </Paper>
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
        teams: `/api/events/${user.eventId}/teams`,
        eventState: `/api/events/${user.eventId}/state`,
        tables: `/api/events/${user.eventId}/tables`,
        matches: `/api/events/${user.eventId}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

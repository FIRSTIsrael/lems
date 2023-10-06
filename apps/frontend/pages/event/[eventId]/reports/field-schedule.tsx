import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Stack } from '@mui/material';
import { Event, Team, SafeUser, RoleTypes, RobotGameMatch, RobotGameTable } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import RoundSchedule from '../../../../components/field/round-schedule';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, tables, matches, teams: initialTeams }) => {
  const router = useRouter();
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);

  const refereeGeneralSchedule = event.schedule?.filter(s => s.roles.includes('referee')) || [];

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        } else {
          return t;
        }
      })
    );
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['pit-admin'], undefined, [
    { name: 'teamRegistered', handler: handleTeamRegistered }
  ]);

  const practiceMatches = matches.filter(m => m.type === 'practice');
  const rankingMatches = matches.filter(m => m.type === 'ranking');

  return (
    <RoleAuthorizer user={user} allowedRoles={[...RoleTypes]} onFail={() => router.back()}>
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו״ז שיפוט | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus !== 'connecting'}
      >
        <Stack spacing={2} mt={4}>
          {[...new Set(practiceMatches.flatMap(m => m.round))].map(r => (
            <RoundSchedule
              key={'practice' + r}
              roundType={'practice'}
              roundNumber={r}
              matches={practiceMatches.filter(m => m.round === r)}
              tables={tables}
              teams={teams}
            />
          ))}
        </Stack>
        <Stack spacing={2} mt={4}>
          {[...new Set(rankingMatches.flatMap(m => m.round))].map(r => (
            <RoundSchedule
              key={'ranking' + r}
              roundType={'ranking'}
              roundNumber={r}
              matches={rankingMatches.filter(m => m.round === r)}
              tables={tables}
              teams={teams}
            />
          ))}
        </Stack>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const eventPromise = apiFetch(
      `/api/events/${user.event}?withSchedule=true`,
      undefined,
      ctx
    ).then(res => res?.json());

    const tablesPromise = apiFetch(`/api/events/${user.event}/tables`, undefined, ctx).then(res =>
      res?.json()
    );

    const matchesPromise = apiFetch(`/api/events/${user.event}/matches`, undefined, ctx).then(res =>
      res?.json()
    );

    const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
      res?.json()
    );

    const [tables, matches, event, teams] = await Promise.all([
      tablesPromise,
      matchesPromise,
      eventPromise,
      teamsPromise
    ]);

    return { props: { user, event, tables, matches, teams } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

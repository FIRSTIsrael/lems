import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Event,
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  EventState,
  Team
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/general/welcome-header';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import HeadRefereeRoundSchedule from '../../../components/field/headReferee/head-referee-round-schedule';
import ScoresheetStatusReferences from '../../../components/field/headReferee/scoresheet-status-references';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  tables: Array<WithId<RobotGameTable>>;
  scoresheets: Array<WithId<Scoresheet>>;
  matches: Array<WithId<RobotGameMatch>>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  tables,
  scoresheets: initialScoresheets,
  matches: initialMatches,
  teams: initialTeams
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [scoresheets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);

  const headRefereeGeneralSchedule =
    (showGeneralSchedule && event.schedule?.filter(s => s.roles.includes('head-referee'))) || [];

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
    newEventState: WithId<EventState>
  ) => {
    setEventState(newEventState);
    updateMatches(newMatch);
  };

  const updateScoresheet = (scoresheet: WithId<Scoresheet>) => {
    setScoresheets(scoresheets =>
      scoresheets.map(s => {
        if (s._id === scoresheet._id) {
          return scoresheet;
        }
        return s;
      })
    );
  };

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

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchAborted', handler: handleMatchEvent },
    { name: 'matchParticipantPrestarted', handler: handleMatchEvent },
    { name: 'scoresheetStatusChanged', handler: updateScoresheet },
    { name: 'teamRegistered', handler: handleTeamRegistered }
  ]);

  const practiceMatches = matches.filter(m => m.type === 'practice');
  const rankingMatches = matches.filter(m => m.type === 'ranking');

  const roundSchedules = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => (
      <Grid xs={12} key={'practice' + r}>
        <HeadRefereeRoundSchedule
          event={event}
          eventState={eventState}
          eventSchedule={headRefereeGeneralSchedule}
          roundType={'practice'}
          roundNumber={r}
          tables={tables}
          matches={practiceMatches.filter(m => m.round === r)}
          scoresheets={scoresheets}
        />
      </Grid>
    ))
    .concat(
      [...new Set(rankingMatches.flatMap(m => m.round))].map(r => (
        <Grid xs={12} key={'ranking' + r}>
          <HeadRefereeRoundSchedule
            event={event}
            eventState={eventState}
            eventSchedule={headRefereeGeneralSchedule}
            roundType={'ranking'}
            roundNumber={r}
            tables={tables}
            matches={rankingMatches.filter(m => m.round === r)}
            scoresheets={scoresheets}
          />
        </Grid>
      ))
    );

  return (
    <RoleAuthorizer user={user} allowedRoles="head-referee" onFail={() => router.back()}>
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <WelcomeHeader event={event} user={user} />
        <Paper sx={{ p: 2 }}>
          <ScoresheetStatusReferences />
        </Paper>
        <Grid container spacing={2} my={4}>
          {...roundSchedules}
        </Grid>
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
        tables: `/api/events/${user.event}/tables`,
        matches: `/api/events/${user.event}/matches`,
        scoresheets: `/api/events/${user.event}/scoresheets`,
        teams: `/api/events/${user.event}/teams`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

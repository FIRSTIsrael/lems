import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  DivisionState,
  Team
} from '@lems/types';
import { RoleAuthorizer } from '../../components/role-authorizer';
import ConnectionIndicator from '../../components/connection-indicator';
import Layout from '../../components/layout';
import ReportLink from '../../components/general/report-link';
import InsightsLink from '../../components/general/insights-link';
import WelcomeHeader from '../../components/general/welcome-header';
import { apiFetch, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import HeadRefereeRoundSchedule from '../../components/field/head-referee/head-referee-round-schedule';
import ScoresheetStatusReferences from '../../components/field/head-referee/scoresheet-status-references';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  tables: Array<WithId<RobotGameTable>>;
  scoresheets: Array<WithId<Scoresheet>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  tables,
  scoresheets: initialScoresheets,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [scoresheets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);

  const headRefereeGeneralSchedule =
    (showGeneralSchedule && division.schedule?.filter(s => s.roles.includes('head-referee'))) || [];

  useEffect(() => {
    setTimeout(() => {
      const currentMatch = matches.find(m => m._id == divisionState.loadedMatch);
      if (currentMatch) scrollToSelector(`match-${currentMatch.number}`);
    }, 0);
  }, []);

  const scrollToSelector = (selector: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

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
    newDivisionState?: WithId<DivisionState>
  ) => {
    updateMatches(newMatch);
    if (newDivisionState) setDivisionState(newDivisionState);
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

  const handleScoresheetStatusChanged = (scoresheet: WithId<Scoresheet>) => {
    updateScoresheet(scoresheet);
    if (scoresheet.status === 'waiting-for-head-ref')
      enqueueSnackbar(`דף ניקוד הועבר לטיפולך!`, {
        variant: 'warning',
        persist: true,
        preventDuplicate: true
      });
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

  const { connectionStatus } = useWebsocket(
    division._id.toString(),
    ['field', 'pit-admin'],
    undefined,
    [
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent },
      { name: 'scoresheetUpdated', handler: updateScoresheet },
      { name: 'scoresheetStatusChanged', handler: handleScoresheetStatusChanged },
      { name: 'teamRegistered', handler: handleTeamRegistered }
    ]
  );

  const practiceMatches = matches.filter(m => m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.stage === 'ranking');

  const roundSchedules = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => (
      <Grid xs={12} key={'practice' + r}>
        <HeadRefereeRoundSchedule
          division={division}
          divisionState={divisionState}
          divisionSchedule={headRefereeGeneralSchedule}
          roundStage={'practice'}
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
            division={division}
            divisionState={divisionState}
            divisionSchedule={headRefereeGeneralSchedule}
            roundStage={'ranking'}
            roundNumber={r}
            tables={tables}
            matches={rankingMatches.filter(m => m.round === r)}
            scoresheets={scoresheets}
          />
        </Grid>
      ))
    );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="head-referee"
      onFail={() => {
        router.push(`/division/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            {divisionState.completed ? (
              <InsightsLink division={division} />
            ) : (
              <ReportLink division={division} />
            )}
          </Stack>
        }
        color={division.color}
      >
        <WelcomeHeader division={division} user={user} />
        <Paper sx={{ p: 2 }}>
          <ScoresheetStatusReferences />
          <Typography textAlign="center" fontSize="0.85rem" sx={{ pt: 1 }} color="text.secondary">
            הניקוד במקצה יופיע מעל הכפתור. צבע הרקע של הניקוד מעיד על ציון המקצועיות האדיבה של
            הקבוצה.
          </Typography>
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
        division: `/api/divisions/${user.divisionId}/?withSchedule=true`,
        divisionState: `/api/divisions/${user.divisionId}/state`,
        tables: `/api/divisions/${user.divisionId}/tables`,
        matches: `/api/divisions/${user.divisionId}/matches`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

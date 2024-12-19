import { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  DivisionState,
  Team,
  DivisionWithEvent
} from '@lems/types';
import { RoleAuthorizer } from '../../components/role-authorizer';
import Layout from '../../components/layout';
import WelcomeHeader from '../../components/general/welcome-header';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import HeadRefereeRoundSchedule from '../../components/field/head-referee/head-referee-round-schedule';
import ScoresheetStatusReferences from '../../components/field/head-referee/scoresheet-status-references';
import { localizeDivisionTitle } from '../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
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
  const [showGeneralSchedule] = useState<boolean>(true);

  const headRefereeGeneralSchedule =
    (showGeneralSchedule && division.schedule?.filter(s => s.roles.includes('head-referee'))) || [];

  useEffect(() => {
    setTimeout(() => {
      const currentMatch = matches.find(m => m._id == divisionState.loadedMatch);
      if (currentMatch) scrollToSelector(`match-${currentMatch.number}`);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Grid key={'practice' + r} size={12}>
        <HeadRefereeRoundSchedule
          division={division}
          divisionState={divisionState}
          divisionSchedule={headRefereeGeneralSchedule}
          roundStage="practice"
          roundNumber={r}
          tables={tables}
          matches={practiceMatches.filter(m => m.round === r)}
          scoresheets={scoresheets}
        />
      </Grid>
    ))
    .concat(
      [...new Set(rankingMatches.flatMap(m => m.round))].map(r => (
        <Grid key={'ranking' + r} size={12}>
          <HeadRefereeRoundSchedule
            division={division}
            divisionState={divisionState}
            divisionSchedule={headRefereeGeneralSchedule}
            roundStage="ranking"
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
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        divisionState={divisionState}
        color={division.color}
      >
        <WelcomeHeader division={division} user={user} />
        <Paper sx={{ p: 2 }}>
          <ScoresheetStatusReferences />
          <Typography textAlign="center" fontSize="0.85rem" sx={{ pt: 1 }} color="textSecondary">
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
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}/?withSchedule=true&withEvent=true`,
        divisionState: `/api/divisions/${divisionId}/state`,
        tables: `/api/divisions/${divisionId}/tables`,
        matches: `/api/divisions/${divisionId}/matches`,
        scoresheets: `/api/divisions/${divisionId}/scoresheets`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

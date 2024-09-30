import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  SafeUser,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingDeliberation,
  ADVANCEMENT_PERCENTAGE
} from '@lems/types';
import { reorder } from '@lems/utils/arrays';
import { fullMatch } from '@lems/utils/objects';
import ScoresPerRoomChart from '../../../components/insights/charts/scores-per-room-chart';
import TeamPool from '../../../components/deliberations/team-pool';
import AwardList from '../../../components/deliberations/award-list';
import CategoryDeliberationControlPanel from '../../../components/deliberations/category/category-deliberation-control-panel';
import LockOverlay from '../../../components/general/lock-overlay';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import ConnectionIndicator from '../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { DragDropContext } from 'react-beautiful-dnd';
import { Box, Paper, Typography } from '@mui/material';
import ChampionsDeliberationsGrid from '../../../components/deliberations/final/champions-deliberation-grid';
import ChampionsPodium from '../../../components/deliberations/final/champions-podium';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  rankings: { [key in JudgingCategory]: Array<ObjectId> };
  robotGameRankings: Array<ObjectId>;
  deliberation: WithId<JudgingDeliberation>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams,
  rubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  rankings,
  robotGameRankings,
  deliberation: initialDeliberation
}) => {
  const router = useRouter();
  const [deliberation, setDeliberation] = useState(initialDeliberation);

  if (!deliberation.available) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('הדיון טרם התחיל.', { variant: 'info' });
  }

  const advancingTeams = Math.round(teams.length * ADVANCEMENT_PERCENTAGE);
  const teamsWithRanks = teams
    .filter(team => team.registered)
    .map(team => {
      const calculateRank = (index: number) => (index === -1 ? teams.length + 1 : index + 1);
      const cvRank = calculateRank(rankings['core-values'].findIndex(id => id === team._id));
      const ipRank = calculateRank(rankings['innovation-project'].findIndex(id => id === team._id));
      const rdRank = calculateRank(rankings['robot-design'].findIndex(id => id === team._id));
      const rgRank = calculateRank(robotGameRankings.findIndex(id => id === team._id));
      return {
        ...team,
        cvRank,
        ipRank,
        rdRank,
        rgRank,
        totalRank: (cvRank + ipRank + rdRank + rgRank) / 4
      };
    });
  const elegibleTeams = useMemo(
    () =>
      teamsWithRanks
        .sort((a, b) => {
          let place = a.totalRank - b.totalRank;
          if (place !== 0) return place;
          place = a.cvRank - b.cvRank; // Tiebreaker 1 - CV score
          if (place !== 0) return place;
          place = b.number - a.number; // Tiebreaker 2 - Team Number
          return place;
        })
        .filter(t => !deliberation.disqualifications.includes(t._id))
        .slice(0, advancingTeams),
    [deliberation.disqualifications]
  );

  const handleDeliberationEvent = (newDeliberation: WithId<JudgingDeliberation>) => {
    if (
      newDeliberation._id.toString() === deliberation._id.toString() &&
      !fullMatch(newDeliberation, deliberation)
    ) {
      setDeliberation(newDeliberation);
    }
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging'],
    undefined,
    [
      { name: 'judgingDeliberationStarted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationCompleted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationUpdated', handler: handleDeliberationEvent }
    ]
  );

  console.log(elegibleTeams);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge-advisor']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1900}
        back={`/lems/${user.role}`}
        title={`דיון סופי | בית ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        {deliberation.status === 'completed' && <LockOverlay />}
        <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
          <Grid xs={8}>
            <ChampionsDeliberationsGrid
              teams={elegibleTeams}
              rooms={rooms}
              sessions={sessions}
              cvForms={cvForms}
              scoresheets={scoresheets}
            />
          </Grid>
          <Grid xs={4}>
            <Paper component={Box} width="100%" height="100%">
              <Typography>Control</Typography>
            </Paper>
          </Grid>
          <Grid xs={6}>
            <ChampionsPodium teams={[null, null, null, null]} setTeams={() => {}} />
          </Grid>
          <Grid xs={6}>
            <ScoresPerRoomChart division={division} height={210} />
          </Grid>
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
        division: `/api/divisions/${user.divisionId}`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        rubrics: `/api/divisions/${user.divisionId}/rubrics/core-values`, //For optional awards
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`, //For optional awards (GP values)
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`,
        rankings: `/api/divisions/${user.divisionId}/rankings/rubrics`,
        robotGameRankings: `/api/divisions/${user.divisionId}/rankings/robot-game`,
        deliberation: `/api/divisions/${user.divisionId}/deliberations/final`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

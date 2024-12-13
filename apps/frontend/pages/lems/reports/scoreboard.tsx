import { useState, useMemo } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper } from '@mui/material';
import { DataGrid, GridColDef, GridComparatorFn } from '@mui/x-data-grid';
import {
  DivisionWithEvent,
  DivisionState,
  RoleTypes,
  SafeUser,
  Scoresheet,
  Team
} from '@lems/types';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { useWebsocket } from '../../../hooks/use-websocket';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedMatchStage } from '../../../localization/field';
import { localizedRoles } from '../../../localization/roles';
import { localizeTeam } from '../../../localization/teams';
import { compareScoreArrays } from '@lems/utils/arrays';
import { localizeDivisionTitle } from '../../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  teams: Array<WithId<Team>>;
  divisionState: DivisionState;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams,
  divisionState,
  scoresheets: initialScoresheets
}) => {
  const router = useRouter();
  const [scoresheets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);

  const teamNumberComparator: GridComparatorFn<Team> = (v1, v2) => v1.number - v2.number;

  const handleScoresheetEvent = (scoresheet: WithId<Scoresheet>) => {
    setScoresheets(scoresheets =>
      scoresheets.map(s => {
        if (s._id === scoresheet._id) {
          return scoresheet;
        }
        return s;
      })
    );
  };

  const { connectionStatus } = useWebsocket(division._id.toString(), ['field'], undefined, [
    { name: 'scoresheetUpdated', handler: handleScoresheetEvent }
  ]);

  const rounds = useMemo(
    () => [
      ...new Set([
        ...scoresheets
          .filter(s => s.stage === divisionState.currentStage)
          .map(s => {
            return s.round;
          })
          .sort((a, b) => a - b)
      ])
    ],
    [divisionState.currentStage, scoresheets]
  );

  const columns: GridColDef[] = [
    {
      field: 'rank',
      headerName: 'דירוג',
      width: 80
    },
    {
      field: 'team',
      headerName: 'קבוצה',
      width: 350,
      valueFormatter: (value: Team) => localizeTeam(value),
      sortComparator: teamNumberComparator
    },
    ...rounds.map(r => ({
      field: `round-${r}`,
      headerName: `סבב ${localizedMatchStage[divisionState.currentStage]} #${r}`,
      width: 125
    })),
    {
      field: 'max',
      headerName: 'ניקוד גבוה ביותר',
      width: 150
    }
  ];

  const rows = useMemo(() => {
    const teamsWithScores = teams.map(team => {
      return {
        id: team._id,
        team,
        scores: rounds.map(
          roundNumber =>
            scoresheets
              .filter(s => s.teamId === team._id && s.stage === divisionState.currentStage)
              .find(s => s.round === roundNumber)?.data?.score
        )
      };
    });

    const teamsWithRoundScores = teamsWithScores.map(row => {
      const roundScores: { [key: string]: number } = {};
      row.scores.forEach((score, index) => (roundScores[`round-${index + 1}`] = score || 0));

      return {
        ...row,
        ...roundScores
      };
    });

    const teamsWithMaxScores = teamsWithRoundScores.map(row => ({
      ...row,
      max: Math.max(...row.scores.map(score => score || 0))
    }));

    teamsWithMaxScores.sort((a, b) => compareScoreArrays(a.scores, b.scores));

    const dataGridRows = teamsWithMaxScores.map((row, index) => ({
      rank: index + 1,
      ...row
    }));

    return dataGridRows;
  }, [divisionState.currentStage, rounds, scoresheets, teams]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - טבלת ניקוד | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        back={`/lems/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={division.color}
      >
        <Paper
          sx={{
            my: 4,
            textAlign: 'center',
            height: '85vh'
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100
                }
              }
            }}
            hideFooter
            disableColumnMenu
            disableColumnFilter
            disableColumnSelector
            disableRowSelectionOnClick
          />
        </Paper>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`,
        divisionState: `/api/divisions/${divisionId}/state`,
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

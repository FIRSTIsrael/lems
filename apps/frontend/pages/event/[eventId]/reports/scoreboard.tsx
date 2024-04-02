import { useState, useMemo } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper } from '@mui/material';
import { DataGrid, GridColDef, GridValueFormatterParams, GridComparatorFn } from '@mui/x-data-grid';
import { Event, EventState, RoleTypes, SafeUser, Scoresheet, Team } from '@lems/types';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedMatchStage } from '../../../../localization/field';
import { localizedRoles } from '../../../../localization/roles';
import { localizeTeam } from '../../../../localization/teams';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  eventState: EventState;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  teams,
  eventState,
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

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'scoresheetUpdated', handler: handleScoresheetEvent }
  ]);

  const rounds = useMemo(
    () => [
      ...new Set([
        ...scoresheets
          .filter(s => s.stage === eventState.currentStage)
          .map(s => {
            return s.round;
          })
          .sort((a, b) => a - b)
      ])
    ],
    [eventState.currentStage, scoresheets]
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
      valueFormatter: (params: GridValueFormatterParams) => localizeTeam(params.value),
      sortComparator: teamNumberComparator
    },
    ...rounds.map(r => ({
      field: `round-${r}`,
      headerName: `סבב ${localizedMatchStage[eventState.currentStage]} #${r}`,
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
              .filter(s => s.teamId === team._id && s.stage === eventState.currentStage)
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

    teamsWithMaxScores.sort((a, b) => b.max - a.max);

    const dataGridRows = teamsWithMaxScores.map((row, index) => ({
      rank: index + 1,
      ...row
    }));

    return dataGridRows;
  }, [eventState.currentStage, rounds, scoresheets, teams]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - טבלת ניקוד | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={event.color}
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
        scoresheets: `/api/events/${user.eventId}/scoresheets`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

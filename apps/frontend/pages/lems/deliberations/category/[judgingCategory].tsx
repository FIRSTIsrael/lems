import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  SafeUser,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom
} from '@lems/types';
import { localizedJudgingCategory, rubricsSchemas, RubricSchemaSection } from '@lems/season';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams,
  rubrics,
  rooms,
  sessions,
  scoresheets
}) => {
  const router = useRouter();
  const judgingCategory: JudgingCategory = router.query.judgingCategory as JudgingCategory;
  const schema = rubricsSchemas[judgingCategory];
  const fields = schema.sections.flatMap((section: RubricSchemaSection) =>
    section.fields.map(field => ({ field: field.id, headerName: field.title }))
  );
  const awards = schema.awards?.map(award => ({ field: award.id, headerName: award.title })) || [];
  const rankingRounds = [
    ...new Set(scoresheets.filter(s => s.stage === 'ranking').flatMap(s => s.round))
  ];

  const rows = rubrics
    .filter(rubric => rubric.category === judgingCategory)
    .map(rubric => {
      const rubricValues = rubric.data?.values || {};
      const rubricAwards = rubric.data?.awards || {};
      const rowValues: { [key: string]: number } = {};
      Object.entries(rubricValues).forEach(([key, entry]) => {
        rowValues[key] = entry.value;
      });
      const roomId = sessions.find(
        session => session.teamId?.toString() === rubric.teamId.toString()
      )?.roomId;
      const roomName = rooms.find(room => room._id.toString() === roomId?.toString())?.name;

      if (judgingCategory === 'core-values') {
        scoresheets
          .filter(scoresheet => scoresheet.teamId.toString() === rubric.teamId.toString())
          .forEach(
            scoresheet => (rowValues[`gp-${scoresheet.round}`] = scoresheet.data?.gp?.value || 3)
          );
        // TODO: Add CV
      }

      const sum = Object.values(rowValues).reduce((acc, current) => acc + current, 0);

      const team = teams.find(t => t._id.toString() === rubric.teamId.toString());
      return { id: rubric._id, team, room: roomName, ...rowValues, sum, rubricAwards };
    });

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'teamNumber',
      headerName: 'מספר קבוצה',
      type: 'string',
      width: 80,
      valueGetter: (value, row) => row.team?.number
    },
    {
      field: 'room',
      headerName: 'חדר',
      type: 'string',
      width: 60
    },
    ...fields.map(
      field =>
        ({
          ...field,
          type: 'number',
          width: 60
        }) as GridColDef
    ),
    ...(judgingCategory === 'core-values'
      ? rankingRounds.map(
          round =>
            ({
              field: `gp-${round}`,
              headerName: `GP ${round}`,
              type: 'number',
              width: 50
            }) as GridColDef
        )
      : []),
    ...awards.map(
      award =>
        ({
          ...award,
          type: 'boolean',
          width: 50
        }) as GridColDef
    ),
    {
      field: 'sum',
      headerName: 'סה"כ',
      type: 'number',
      width: 60
    },
    { field: '_id', headerName: 'מחוון', width: 50 }
  ];

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['lead-judge', 'judge-advisor']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1920}
        title={`דיון תחום ${
          localizedJudgingCategory[judgingCategory as JudgingCategory].name
        } | בית ${division.name}`}
        // error={connectionStatus === 'disconnected'}
        // action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <Grid container sx={{ pt: 2 }}>
          <Grid xs={6}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 15
                  }
                }
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Grid>
          <Grid xs={6}></Grid>
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
        rubrics: `/api/divisions/${user.divisionId}/rubrics/${ctx.params?.judgingCategory}`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
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

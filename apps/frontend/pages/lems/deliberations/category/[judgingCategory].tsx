import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Division, SafeUser, JudgingCategory, Rubric, Team } from '@lems/types';
import {
  localizedJudgingCategory,
  rubricsSchemas,
  RubricSchemaSection,
  RubricsSchema
} from '@lems/season';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const Page: NextPage<Props> = ({ user, division, rubrics }) => {
  const router = useRouter();
  const judgingCategory: JudgingCategory = router.query.judgingCategory as JudgingCategory;
  const schema = rubricsSchemas[judgingCategory];
  const fields = schema.sections.flatMap((section: RubricSchemaSection) =>
    section.fields.map(field => ({ field: field.id, headerName: field.title }))
  );

  const rows = rubrics
    .filter(rubric => rubric.category === judgingCategory)
    .map(rubric => {
      const values = rubric.data?.values || {};
      const newValues: { [key: string]: number } = {};
      Object.entries(values).forEach(([key, entry]) => {
        newValues[key] = entry.value;
      });
      // Core values: add gp to values
      // Core values: add CV
      const sum = Object.values(newValues).reduce((acc, current) => acc + current, 0);
      return { id: rubric._id, teamId: rubric.teamId, ...newValues, sum };
    });

  const columns: GridColDef<(typeof rows)[number]>[] = [
    ...fields.map(
      field =>
        ({
          ...field,
          type: 'number',
          width: 110
        }) as GridColDef
    ),
    {
      field: 'sum',
      headerName: 'סה"כ',
      type: 'number',
      width: 110
    },
    { field: '_id', headerName: 'מחוון' }
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
        maxWidth={800}
        title={`דיון תחום ${
          localizedJudgingCategory[judgingCategory as JudgingCategory].name
        } | בית ${division.name}`}
        // error={connectionStatus === 'disconnected'}
        // action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 20
              }
            }
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
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
        rubrics: `/api/divisions/${user.divisionId}/rubrics/${ctx.params?.judgingCategory}`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

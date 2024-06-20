import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Division, SafeUser, JudgingCategory, Rubric, Team } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
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

  const judgingCategory: JudgingCategory =
    typeof router.query.judgingCategory === 'string'
      ? (router.query.judgingCategory as JudgingCategory)
      : 'core-values'; // No default, should error if invalid

  const rows = rubrics
    .filter(rubric => rubric.category === judgingCategory)
    .map(rubric => {
      const values = Object.keys(rubric.data?.values || {}).reduce(
        (acc: { [key: string]: number }, key) => {
          acc[key] = rubric.data?.values[key].value || 0;
          return acc;
        },
        {}
      );
      const sum = Object.values(values).reduce((acc, current) => acc + current, 0);
      return { _id: rubric._id, teamId: rubric.teamId, ...values, sum };
    });

  const columns: GridColDef<(typeof rows)[number]>[] = [
    //TODO: get keys from rubric schema, map over them to create cols
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
      ></Layout>
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
        rubrics: `/api/divisions/${user.divisionId}/rubrics`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

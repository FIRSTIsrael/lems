import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { SafeUser, Division, RoleTypes } from '@lems/types';
import Layout from '../../../../components/layout';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { enqueueSnackbar } from 'notistack';
import { WithId } from 'mongodb';

interface GridPaperLinkProps {
  path: string;
  children?: React.ReactNode;
}

const GridPaperLink: React.FC<GridPaperLinkProps> = ({ path, children }) => {
  return (
    <Grid xs={3}>
      <Paper>
        <Button
          href={'reports/' + path}
          fullWidth
          sx={{ py: 8, px: 10, textAlign: 'center', color: '#000' }}
        >
          {children}
        </Button>
      </Paper>
    </Grid>
  );
};

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
}

const Page: NextPage<Props> = ({ user, division }) => {
  const router = useRouter();
  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/division/${division._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${division.name}`}
        back={user.role !== 'reports' ? `/division/${division._id}/${user.role}` : undefined}
        color={division.color}
      >
        <Grid container spacing={3} columns={6} direction="row" mt={4}>
          <GridPaperLink path="judging-status">
            <Typography variant="h4">מצב השיפוט</Typography>
          </GridPaperLink>
          <GridPaperLink path="field-status">
            <Typography variant="h4">מצב הזירה</Typography>
          </GridPaperLink>
          <GridPaperLink path="team-list">
            <Typography variant="h4">רשימת קבוצות</Typography>
          </GridPaperLink>
          <GridPaperLink path="judging-schedule">
            <Typography variant="h4">לו״ז שיפוט</Typography>
          </GridPaperLink>
          <GridPaperLink path="field-schedule">
            <Typography variant="h4">לו״ז זירה</Typography>
          </GridPaperLink>
          <GridPaperLink path="pit-map">
            <Typography variant="h4">מפת פיטים</Typography>
          </GridPaperLink>
          <GridPaperLink path="general-schedule">
            <Typography variant="h4">לו״ז כללי</Typography>
          </GridPaperLink>
          <GridPaperLink path="field-timer">
            <Typography variant="h4">שעון מקצים</Typography>
          </GridPaperLink>
          <GridPaperLink path="scoreboard">
            <Typography variant="h4">טבלת ניקוד</Typography>
          </GridPaperLink>
        </Grid>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      { division: `/api/divisions/${user.divisionId}` },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { SafeUser, DivisionWithEvent, RoleTypes } from '@lems/types';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { enqueueSnackbar } from 'notistack';
import { WithId } from 'mongodb';
import { localizeDivisionTitle } from '../../../localization/event';

interface GridPaperLinkProps {
  path: string;
  children?: React.ReactNode;
}

const GridPaperLink: React.FC<GridPaperLinkProps> = ({ path, children }) => {
  return (
    <Grid size={3}>
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
  division: WithId<DivisionWithEvent>;
}

const Page: NextPage<Props> = ({ user, division }) => {
  const router = useRouter();
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
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        back={user.role !== 'reports' ? `/lems/${user.role}` : undefined}
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
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      { division: `/api/divisions/${divisionId}?withEvent=true` },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

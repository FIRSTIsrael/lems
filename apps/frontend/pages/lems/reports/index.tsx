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
  const router = useRouter();

  const handleClick = () => {
    const queryString = router.query.divisionId
      ? new URLSearchParams({ divisionId: router.query.divisionId as string }).toString()
      : '';
    const url = `/lems/reports/${path}${queryString ? `?${queryString}` : ''}`;
    router.push(url);
  };

  return (
    <Grid size={3}>
      <Paper>
        <Button
          fullWidth
          sx={{ py: 8, px: 10, textAlign: 'center', color: '#000' }}
          onClick={handleClick}
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
        user={user}
        division={division}
      >
        <Grid container spacing={3} columns={6} direction="row" my={4}>
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
          <GridPaperLink path="scoreboard">
            <Typography variant="h4">טבלת ניקוד</Typography>
          </GridPaperLink>
          <GridPaperLink path="award-schema">
            <Typography variant="h4">סדר הפרסים</Typography>
          </GridPaperLink>
          <GridPaperLink path="notepad">
            <Typography variant="h4">פתקים</Typography>
          </GridPaperLink>
          <GridPaperLink path="field-timer">
            <Typography variant="h4">שעון מקצים</Typography>
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

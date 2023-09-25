import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { User, Event } from '@lems/types';
import Layout from '../../../../components/layout';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';

interface GridPaperLinkProps {
  path: string;
  children?: React.ReactNode;
}

const GridPaperLink: React.FC<GridPaperLinkProps> = ({ path, children }) => {
  return (
    <Grid xs={3}>
      <Paper>
        <Button
          href={'display/' + path}
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
  user: User;
  event: Event;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const router = useRouter();

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['display', 'head-referee']}
      onFail={() => router.back()}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
      >
        <Grid container spacing={3} columns={6} direction="row" mt={4}>
          <GridPaperLink path="judging-status">
            <Typography variant="h4">מצב השיפוט</Typography>
          </GridPaperLink>
          <GridPaperLink path="team-list">
            <Typography variant="h4">רשימת קבוצות</Typography>
          </GridPaperLink>
          <GridPaperLink path="judging-schedule">
            <Typography variant="h4">{'לו"ז שיפוט'}</Typography>
          </GridPaperLink>
          <GridPaperLink path="judging-status">
            <Typography variant="h4">ג</Typography>
          </GridPaperLink>
          <GridPaperLink path="judging-status">
            <Typography variant="h4">ד</Typography>
          </GridPaperLink>
        </Grid>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
    const event = await apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    return { props: { user, event } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;

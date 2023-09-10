import { GetServerSideProps, NextPage } from 'next';
import { Container, Paper, Typography } from '@mui/material';
import { SafeUser } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch } from '../../../lib/utils/fetch';

interface Props {
  user: SafeUser;
}

const Page: NextPage<Props> = ({ user }) => {
  return (
    <RoleAuthorizer user={user} allowedRoles="judge-advisor">
      <Container>
        <Paper sx={{ height: 200, mt: 10 }}>
          <Typography variant="h2" textAlign={'center'}>
            Hello Judge Advisor
          </Typography>
        </Paper>
      </Container>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const userPromise = apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
  const [user] = await Promise.all([userPromise]);

  return { props: { user } };
};

export default Page;

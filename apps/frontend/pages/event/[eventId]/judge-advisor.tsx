import { GetServerSideProps, NextPage } from 'next';
import { Container, Paper, Typography } from '@mui/material';
import { RoleAuthorizer } from '../../../components/role-authorizer';

const Page: NextPage = () => {
  return (
    <RoleAuthorizer roles="judge-advisor">
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

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Page;

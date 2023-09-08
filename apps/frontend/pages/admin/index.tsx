import { GetServerSideProps } from 'next';
import { Container, Paper, Typography } from '@mui/material';

export function Index() {
  return (
    <Container>
      <Paper sx={{ height: 200, mt: 10 }}>
        <Typography variant="h2" textAlign={'center'}>
          Hello admin
        </Typography>
      </Paper>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Index;

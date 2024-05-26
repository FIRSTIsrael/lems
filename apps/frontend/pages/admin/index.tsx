import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Paper, Typography, Stack, ListItemButton, Modal } from '@mui/material';
import { WithId } from 'mongodb';
import { Division, SafeUser } from '@lems/types';
import { serverSideGetRequests } from '../../lib/utils/fetch';
import Layout from '../../components/layout';
import DivisionSelector from '../../components/general/division-selector';

interface Props {
  user: WithId<SafeUser>;
  divisions: Array<WithId<Division>>;
}

const Page: NextPage<Props> = ({ user, divisions }) => {
  const router = useRouter();

  return (
    <Layout maxWidth="sm" title="ממשק ניהול">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h2" textAlign={'center'}>
            בחירת אירוע
          </Typography>
          <DivisionSelector
            divisions={divisions}
            onChange={divisionId => router.push(`/admin/event/${divisionId}`)}
          />
          <ListItemButton
            key={'create-division'}
            dense
            sx={{ borderRadius: 2, minHeight: '50px' }}
            onClick={() => router.push('/admin/event/create')}
          >
            צור אירוע
          </ListItemButton>
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests(
    { user: '/api/me', divisions: '/public/divisions' },
    ctx
  );
  return { props: data };
};

export default Page;

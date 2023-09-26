import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Paper, Typography, Box, Stack } from '@mui/material';
import { WithId } from 'mongodb';
import { Event, SafeUser } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import GenerateScheduleButton from '../../../components/admin/generate-schedule';
import UploadScheduleButton from '../../../components/admin/upload-schedule';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`}>
      <Paper sx={{ p: 4, mt: 4 }}>
        <Stack alignItems="center" justifyContent="center" minHeight={500}>
          <Typography variant="h2">{event.name}</Typography>
          <Box>
            <UploadScheduleButton event={event} sx={{ m: 2 }} />
            <GenerateScheduleButton event={event} sx={{ m: 2 }} />
          </Box>
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

  const event = await apiFetch(`/api/events/${ctx.params?.eventId}`, undefined, ctx).then(res =>
    res?.json()
  );

  return { props: { user, event } };
};

export default Page;

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { apiFetch } from '../../../lib/utils/fetch';
import { Avatar, Box, Typography } from '@mui/material';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import { WithId } from 'mongodb';
import { Event } from '@lems/types';

interface AdminEventPageProps {
  event: WithId<Event>;
}

const AdminEventPage = ({ event }: AdminEventPageProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        pb: 3
      }}
    >
      <Avatar
        sx={{
          bgcolor: '#ccfbf1',
          color: '#2dd4bf',
          width: '2rem',
          height: '2rem',
          mr: 1
        }}
      >
        <ManageIcon sx={{ fontSize: '1rem' }} />
      </Avatar>
      <Typography variant="h2" fontSize="1.25rem">
        {event.name}
      </Typography>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const event = await apiFetch(`/public/events/${(ctx.params as any).eventId}`, undefined, ctx).then(res =>
    res?.json()
  );
  return { props: { event } };
};

AdminEventPage.layout = 'admin';

export default AdminEventPage;

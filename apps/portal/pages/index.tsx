import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import Image from 'next/image';
import {
  Box,
  Button,
  Container,
  Divider,
  keyframes,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { PortalEvent } from '@lems/types';
import { fetchEvents } from '../lib/api';

interface Props {
  events: PortalEvent[];
}

const Page: NextPage<Props> = ({ events }) => {
  const router = useRouter();

  const liveAnimation = keyframes`0% {
    transform: scale(1, 1);
  }
  100% {
    transform: scale(3.5, 3.5);
    background-color: rgba(255, 0, 0, 0);
  }`;

  const activeEvents = events.filter(event => {
    const eventDate = dayjs(event.date);
    const today = dayjs();
    return eventDate.isSame(today, 'day');
  });

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 2, alignItems: 'center', display: 'flex', flexDirection: 'column' }}
    >
      <Box
        width="100%"
        position="relative"
        overflow="hidden"
        paddingBottom="52.5%" // Creates 1.904 aspect ratio
      >
        <Image
          src="/assets/season-banner.webp"
          alt=""
          fill
          style={{
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%'
          }}
        />
      </Box>
      <Paper sx={{ p: 2, my: 2, width: '95%' }}>
        <Stack direction="row" alignItems="center" spacing={2} ml={1}>
          <Typography variant="h2" maxWidth="90%">
            אירועים פעילים
          </Typography>
          <Box
            component="span"
            display="inline-block"
            position="relative"
            bgcolor="red"
            width={12}
            height={12}
            border="1px solid rgba(0, 0, 0, 0.1)"
            borderRadius="50%"
            zIndex={1}
            sx={{
              '::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                backgroundColor: 'rgba(255, 0, 0, 0.6)',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                animation: `${liveAnimation} 2s ease-in-out infinite`,
                zIndex: -1
              }
            }}
          />
        </Stack>
        <Typography ml={1} variant="body1" color="text.secondary">
          {dayjs().format('DD/MM/YYYY')}{' '}
        </Typography>
        <Stack spacing={1} mt={2} divider={<Divider flexItem variant="middle" />}>
          {activeEvents.length === 0 && (
            <Typography pl={1} variant="body1">
              אין אירועים פעילים
            </Typography>
          )}
          {activeEvents.map(event => (
            <Button
              key={event.id}
              sx={{
                color: 'inherit',
                justifyContent: 'space-between',
                textAlign: 'left',
                '& .MuiButton-endIcon svg': { fontSize: 30 }
              }}
              endIcon={<ChevronLeftIcon />}
              fullWidth
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <span>
                <Typography variant="h4">{event.name}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {event.name}
                </Typography>
              </span>
            </Button>
          ))}
        </Stack>
      </Paper>
      <Box display="flex" justifyContent="center" textAlign="center" mt={2} width="100%">
        <Button
          variant="contained"
          sx={{ width: { xs: '100%', md: '50%' }, borderRadius: 2, minHeight: 50 }}
          size="large"
          onClick={() => router.push('/events')}
        >
          לכל האירועים
        </Button>
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await fetchEvents();
  return { props: { events } };
};

export default Page;

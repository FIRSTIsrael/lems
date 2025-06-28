import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import dayjs from 'dayjs';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { PortalEvent } from '@lems/types';
import { fetchEvents } from '../lib/api';
import EventList from '../components/events/event-list';
import LiveIcon from '../components/live-icon';
import { getMessages } from '../lib/localization';

interface Props {
  events: Array<PortalEvent>;
}

const Page: NextPage<Props> = ({ events }) => {
  const t = useTranslations('pages:index');

  const activeEvents = events.filter(event => {
    const eventDate = dayjs(event.date);
    const today = dayjs();
    return eventDate.isSame(today, 'day');
  });

  return (
    <Container
      maxWidth="md"
      sx={{ my: 2, alignItems: 'center', display: 'flex', flexDirection: 'column' }}
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
            {t('active-events')}
          </Typography>
          <LiveIcon />
        </Stack>
        <Typography ml={1} variant="body1" color="text.secondary" gutterBottom>
          {dayjs().format('DD/MM/YYYY')}
        </Typography>
        <EventList events={activeEvents} emptyText="אין אירועים פעילים" />
      </Paper>
      <Box display="flex" justifyContent="center" textAlign="center" mt={2} width="100%">
        <Button
          variant="contained"
          sx={{ width: { xs: '100%', md: '50%' }, borderRadius: 2, minHeight: 50 }}
          size="large"
          LinkComponent={Link}
          href="/events"
        >
          {t('all-events')}
        </Button>
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  locale
}: GetServerSidePropsContext) => {
  const events = await fetchEvents();
  const messages = await getMessages(locale);
  return { props: { events, messages } };
};

export default Page;

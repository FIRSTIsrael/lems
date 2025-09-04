import { useMemo } from 'react';
import dayjs from 'dayjs';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslations } from 'next-intl';
import { Container, Typography, Stack, Paper, List, ListItem, ListItemButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { PortalEvent } from '@lems/types';
import { fetchEvents } from '../../lib/api';
import { getMessages } from '../../locale/get-messages';
import EventList from '../../components/events/event-list';
import RichText from '../../../../../libs/localization/src/lib/rich-text';

interface Props {
  events: Array<PortalEvent>;
}

const Page: NextPage<Props> = ({ events }) => {
  const t = useTranslations('pages.events.index');

  const { current, past, future } = useMemo(() => {
    const today = dayjs();
    const eventsByDate = events.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
    return eventsByDate.reduce(
      (acc, event) => {
        const eventDate = dayjs(event.date).startOf('day');
        if (eventDate.isSame(today, 'day')) {
          acc.current.push(event);
        } else if (eventDate < today) {
          acc.past.push(event);
        } else {
          acc.future.push(event);
        }
        return acc;
      },
      { current: [], past: [], future: [] } as Record<
        'current' | 'past' | 'future',
        Array<PortalEvent>
      >
    );
  }, [events]);

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ my: 2 }}>
      <Grid container spacing={2}>
        {/* Mobile header */}
        <Grid size={12} display={{ xs: 'block', md: 'none' }}>
          <Typography variant="h1" gutterBottom>
            <RichText>{tags => t.rich('fll-events', tags)}</RichText>
          </Typography>
        </Grid>

        {/* Quick Nav */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Paper>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection('current')}>
                  {t('active-events')}
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection('future')}>
                  {t('future-events')}
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection('past')}>
                  {t('past-events')}
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Main Grid */}
        <Grid size={{ xs: 12, md: 10 }}>
          <Typography variant="h1" display={{ xs: 'none', md: 'block' }} mb={4}>
            <RichText>{tags => t.rich('fll-events', tags)}</RichText>
          </Typography>
          <Stack spacing={2}>
            <EventList
              events={current}
              emptyText={t('no-events')}
              title={t('active-events')}
              includeDate
              id="current"
            />
            <EventList
              events={future}
              emptyText={t('no-events')}
              title={t('future-events')}
              includeDate
              id="future"
            />
            <EventList
              events={past}
              emptyText={t('no-events')}
              title={t('past-events')}
              includeDate
              id="past"
            />
          </Stack>
        </Grid>
      </Grid>
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

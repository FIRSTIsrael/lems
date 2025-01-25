import { useMemo } from 'react';
import dayjs from 'dayjs';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Container, Typography, Stack, Paper, List, ListItem, ListItemButton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PortalEvent } from '@lems/types';
import { fetchEvents } from '../../lib/api';
import EventTable from '../../components/events/event-table';

interface Props {
  events: PortalEvent[];
}

const Page: NextPage<Props> = ({ events }) => {
  const router = useRouter();

  const { current, past, future } = useMemo(() => {
    const today = dayjs().startOf('day');
    const eventsByDate = events.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
    return eventsByDate.reduce(
      (acc, event) => {
        const eventDate = dayjs(event.date).startOf('day');
        if (eventDate === today) {
          acc.current.push(event);
        } else if (eventDate < today) {
          acc.past.push(event);
        } else {
          acc.future.push(event);
        }
        return acc;
      },
      { current: [], past: [], future: [] } as Record<'current' | 'past' | 'future', PortalEvent[]>
    );
  }, [events]);

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Mobile header */}
        <Grid size={12} display={{ xs: 'block', md: 'none' }}>
          <Typography variant="h1" gutterBottom>
            אירועי <em>FIRST</em>&nbsp; LEGO League Challenge
          </Typography>
        </Grid>

        {/* Quick Nav */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Paper>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection('current')}>
                  אירועים פעילים
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection('future')}>
                  אירועים עתידיים
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => scrollToSection('past')}>
                  אירועים קודמים
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Main Grid */}
        <Grid size={{ xs: 12, md: 10 }}>
          <Typography variant="h1" gutterBottom display={{ xs: 'none', md: 'block' }}>
            אירועי <em>FIRST</em>&nbsp; LEGO League Challenge
          </Typography>
          <Stack spacing={4}>
            {<EventTable title="אירועים פעילים" events={current} />}
            {<EventTable title="אירועים עתידיים" events={future} />}
            {<EventTable title="אירועים קודמים" events={past} />}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await fetchEvents();
  return { props: { events } };
};

export default Page;

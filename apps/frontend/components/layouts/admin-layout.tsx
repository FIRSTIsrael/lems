import {
  Avatar,
  Grid,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import { apiFetch } from '../../lib/utils/fetch';
import { Event } from '@lems/types';
import EventIcon from '@mui/icons-material/EventOutlined';
import { stringifyTwoDates } from '../../lib/utils/dayjs';
import Layout from '../../components/layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getDivisionBackground, getDivisionColor } from '../../lib/utils/colors';
import { WithId } from 'mongodb';
import NextLink from 'next/link';

interface EventPickerProps {
  events: WithId<Event>[];
}

const EventPicker = ({ events }: EventPickerProps) => {
  const router = useRouter();

  return (
    <Paper sx={{ minHeight: 500, p: 2, textAlign: 'center' }}>
      <Typography variant="h2" fontSize="1.5rem" gutterBottom sx={{ py: 1, px: 2 }}>
        בחרו אירוע
      </Typography>
      {events.map((event, index) => (
        <ListItemButton
          key={`event-${event._id.toString()}-button-${index}`}
          dense
          sx={{ borderRadius: 2 }}
          component={NextLink}
          href={`/admin/event/${event._id.toString()}`}
          selected={router.query.eventId === event._id.toString()}
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                color: getDivisionColor(event.color),
                backgroundColor: getDivisionBackground(event.color)
              }}
            >
              <EventIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={event.name}
            secondary={stringifyTwoDates(event.startDate, event.endDate)}
          />
        </ListItemButton>
      ))}
      <ListItemButton
        key={'create-event'}
        dense
        sx={{ borderRadius: 2, minHeight: '50px' }}
        onClick={() => router.push('/admin/create-event')}
      >
        צור אירוע
      </ListItemButton>
    </Paper>
  );
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents();
  }, []);

  const getEvents = async () => {
    const events = await apiFetch('/public/events').then(res => res?.json());
    setEvents(events);
  };

  return (
    <Layout maxWidth="lg">
      <Paper sx={{ p: 2, my: 6, textAlign: 'center' }}>
        <Typography variant="h2" fontSize="1.5rem" gutterBottom sx={{ py: 1, px: 2 }}>
          ממשק ניהול
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        <Grid xs={4}>
          <EventPicker events={events} />
        </Grid>
        <Grid xs={8}>
          <Paper sx={{ height: 500 }}>{children}</Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}

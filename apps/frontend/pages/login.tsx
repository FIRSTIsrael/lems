import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { WithId, ObjectId } from 'mongodb';
import { Paper, Box, Link } from '@mui/material';
import { Event, JudgingRoom, RobotGameTable, SafeUser } from '@lems/types';
import Layout from '../components/layout';
import EventSelector from '../components/input/event-selector';
import LoginForm from '../components/forms/login-form';
import { apiFetch } from '../lib/utils/fetch';
import AdminLoginForm from '../components/forms/admin-login-form';

interface PageProps {
  events: Array<WithId<Event>>;
}

const Page: NextPage<PageProps> = ({ events }) => {
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(false);
  const [event, setEvent] = useState<WithId<Event> | undefined>(undefined);
  const [rooms, setRooms] = useState<Array<WithId<JudgingRoom>> | undefined>(undefined);
  const [tables, setTables] = useState<Array<WithId<RobotGameTable>> | undefined>(undefined);

  const selectEvent = (eventId: string | ObjectId) => {
    const selectedEvent = events.find(e => e._id == eventId);
    setEvent(selectedEvent);
  };

  useEffect(() => {
    if (event) {
      apiFetch(`/public/events/${event._id}/rooms`)
        .then(res => res.json())
        .then(rooms => setRooms(rooms));
    }
  }, [event]);

  useEffect(() => {
    if (event) {
      apiFetch(`/public/events/${event._id}/tables`)
        .then(res => res.json())
        .then(tables => setTables(tables));
    }
  }, [event]);

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        {isAdminLogin ? (
          <AdminLoginForm />
        ) : event && rooms && tables ? (
          <LoginForm
            event={event}
            rooms={rooms}
            tables={tables}
            onCancel={() => {
              setEvent(undefined);
              setRooms(undefined);
              setTables(undefined);
            }}
          />
        ) : (
          <EventSelector events={events} onChange={selectEvent} />
        )}
      </Paper>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 1.5
        }}
      >
        <Link
          underline="none"
          component="button"
          onClick={() => {
            setIsAdminLogin(!isAdminLogin);
            setEvent(undefined);
            setRooms(undefined);
            setTables(undefined);
          }}
        >
          {isAdminLogin ? 'כניסת מתנדבים' : 'התחברות כמנהל'}
        </Link>
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user: SafeUser = await apiFetch('/api/me', undefined, ctx).then(response => {
    return response.ok ? response.json() : undefined;
  });

  if (user) {
    return user.isAdmin
      ? { redirect: { destination: `/admin`, permanent: false } }
      : { redirect: { destination: `/event/${user.event}`, permanent: false } };
  } else {
    return apiFetch('/public/events', undefined, ctx)
      .then(response => response.json())
      .then((events: Array<WithId<Event>>) => {
        return { props: { events } };
      });
  }
};

export default Page;

import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { WithId, ObjectId } from 'mongodb';
import { Paper, Box, Link, Stack, Typography } from '@mui/material';
import { Event, JudgingRoom, RobotGameTable, SafeUser } from '@lems/types';
import Layout from '../components/layout';
import EventSelector from '../components/general/event-selector';
import LoginForm from '../components/login/login-form';
import AdminLoginForm from '../components/login/admin-login-form';
import { apiFetch } from '../lib/utils/fetch';
import { loadScriptByURL } from '../lib/utils/scripts';

interface PageProps {
  events: Array<WithId<Event>>;
  recaptchaRequired: boolean;
}

const Page: NextPage<PageProps> = ({ events, recaptchaRequired }) => {
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(false);
  const [event, setEvent] = useState<WithId<Event> | undefined>(undefined);
  const [rooms, setRooms] = useState<Array<WithId<JudgingRoom>> | undefined>(undefined);
  const [tables, setTables] = useState<Array<WithId<RobotGameTable>> | undefined>(undefined);

  const selectEvent = (eventId: string | ObjectId) => {
    const selectedEvent = events.find(e => e._id == eventId);
    setEvent(selectedEvent);
  };

  useEffect(() => {
    if (recaptchaRequired) {
      loadScriptByURL(
        'recaptcha-script',
        `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <AdminLoginForm recaptchaRequired={recaptchaRequired} />
        ) : event && rooms && tables ? (
          <LoginForm
            recaptchaRequired={recaptchaRequired}
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
          <Stack direction="column">
            <Typography variant="h2" pb={2} textAlign={'center'}>
              בחירת אירוע
            </Typography>
            <EventSelector
              events={events}
              getEventDisabled={event => !event.hasState}
              onChange={selectEvent}
            />
          </Stack>
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

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  if (user) {
    return user.isAdmin
      ? { redirect: { destination: `/admin`, permanent: false } }
      : { redirect: { destination: `/event/${user.eventId}`, permanent: false } };
  } else {
    return apiFetch('/public/events', undefined, ctx)
      .then(response => response.json())
      .then((events: Array<WithId<Event>>) => {
        return { props: { events, recaptchaRequired } };
      });
  }
};

export default Page;

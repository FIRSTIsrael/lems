import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { WithId, ObjectId } from 'mongodb';
import { Paper, Box, Link, Stack, Typography } from '@mui/material';
import { Event, JudgingRoom, RobotGameTable, SafeUser } from '@lems/types';
import Layout from '../components/layout';
import EventSelector from '../components/general/division-selector';
import LoginForm from '../components/login/login-form';
import AdminLoginForm from '../components/login/admin-login-form';
import { apiFetch } from '../lib/utils/fetch';
import { loadScriptByURL } from '../lib/utils/scripts';

interface PageProps {
  divisions: Array<WithId<Event>>;
  recaptchaRequired: boolean;
}

const Page: NextPage<PageProps> = ({ divisions, recaptchaRequired }) => {
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(false);
  const [division, setEvent] = useState<WithId<Event> | undefined>(undefined);
  const [rooms, setRooms] = useState<Array<WithId<JudgingRoom>> | undefined>(undefined);
  const [tables, setTables] = useState<Array<WithId<RobotGameTable>> | undefined>(undefined);

  const selectEvent = (divisionId: string | ObjectId) => {
    const selectedEvent = divisions.find(e => e._id == divisionId);
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
    if (division) {
      apiFetch(`/public/divisions/${division._id}/rooms`)
        .then(res => res.json())
        .then(rooms => setRooms(rooms));
    }
  }, [division]);

  useEffect(() => {
    if (division) {
      apiFetch(`/public/divisions/${division._id}/tables`)
        .then(res => res.json())
        .then(tables => setTables(tables));
    }
  }, [division]);

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        {isAdminLogin ? (
          <AdminLoginForm recaptchaRequired={recaptchaRequired} />
        ) : division && rooms && tables ? (
          <LoginForm
            recaptchaRequired={recaptchaRequired}
            division={division}
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
              divisions={divisions}
              getEventDisabled={division => !division.hasState}
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
      : { redirect: { destination: `/division/${user.divisionId}`, permanent: false } };
  } else {
    return apiFetch('/public/divisions', undefined, ctx)
      .then(response => response.json())
      .then((divisions: Array<WithId<Event>>) => {
        return { props: { divisions, recaptchaRequired } };
      });
  }
};

export default Page;

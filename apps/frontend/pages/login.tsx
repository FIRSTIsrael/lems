import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { ObjectId } from 'mongodb';
import { Paper, Box, Link } from '@mui/material';
import { LoginPageResponse, LoginPageEvent, SafeUser } from '@lems/types';
import Layout from '../components/layout';
import EventSelector from '../components/input/event-selector';
import LoginForm from '../components/forms/login-form';
import { apiFetch } from '../lib/utils/fetch';
import AdminLoginForm from '../components/forms/admin-login-form';

interface PageProps {
  events: LoginPageResponse;
}

const Page: NextPage<PageProps> = ({ events }) => {
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(false);
  const [event, setEvent] = useState<LoginPageEvent | undefined>(undefined);

  const selectEvent = (eventId: string | ObjectId) => {
    const selectedEvent = events.find(e => e._id == eventId);
    setEvent(selectedEvent);
  };

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        {isAdminLogin ? (
          <AdminLoginForm />
        ) : event ? (
          <LoginForm
            event={event}
            onCancel={() => {
              setEvent(undefined);
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
  console.log(user);

  if (user) {
    return user.isAdmin
      ? { redirect: { destination: `/admin`, permanent: false } }
      : { redirect: { destination: `/event/${user.event}`, permanent: false } };
  } else {
    return apiFetch('/public/pages/login', undefined, ctx)
      .then(response => response.json())
      .then((events: LoginPageResponse) => {
        return { props: { events } };
      });
  }
};

export default Page;

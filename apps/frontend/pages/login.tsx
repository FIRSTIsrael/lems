import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { ObjectId } from 'mongodb';
import { Paper } from '@mui/material';
import { LoginPageResponse, LoginPageEvent } from '@lems/types';
import Layout from '../components/layout';
import EventSelector from '../components/input/event-selector';
import LoginForm from '../components/forms/login-form';
import { apiFetch } from '../lib/utils/fetch';

interface PageProps {
  events: LoginPageResponse;
}

const Page: NextPage<PageProps> = ({ events }) => {
  const [event, setEvent] = useState<LoginPageEvent | undefined>(undefined);

  const selectEvent = (eventId: string | ObjectId) => {
    const selectedEvent = events.find(e => e._id == eventId);
    setEvent(selectedEvent);
  };

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        {event ? (
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
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return apiFetch('/public/pages/login')
    .then(response => response.json())
    .then((events: LoginPageResponse) => {
      return { props: { events } };
    });
};

export default Page;

import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { WithId, ObjectId } from 'mongodb';
import { Paper, Stack, Typography } from '@mui/material';
import { FllEvent, Division, JudgingRoom, RobotGameTable, SafeUser } from '@lems/types';
import { useRecaptcha } from '@lems/shared';
import Layout from '../components/layout';
import EventSelector from '../components/general/event-selector';
import DivisionLoginForm from '../components/login/division-login-form';
import EventLoginForm from '../components/login/event-login-form';
import { apiFetch } from '../lib/utils/fetch';
import { useNotes } from '../hooks/use-notes';
interface PageProps {
  events: Array<WithId<FllEvent>>;
  recaptchaRequired: boolean;
}

const Page: NextPage<PageProps> = ({ events, recaptchaRequired }) => {
  const [event, setEvent] = useState<WithId<FllEvent> | undefined>(undefined);
  const [division, setDivision] = useState<WithId<Division> | undefined>(undefined);
  const [rooms, setRooms] = useState<Array<WithId<JudgingRoom>> | undefined>(undefined);
  const [tables, setTables] = useState<Array<WithId<RobotGameTable>> | undefined>(undefined);

  useRecaptcha(recaptchaRequired);

  // Clear session speficic data when user is logged out.
  const { clearNotes } = useNotes();
  useEffect(() => {
    clearNotes();
  });

  const selectDivision = (eventId: string | ObjectId, divisionId?: string | ObjectId) => {
    const event = events.find(e => String(e._id) === String(eventId));
    if (!event) return;
    setEvent(event);

    if (!event.enableDivisions) {
      setDivision(event.divisions?.[0]);
      return;
    }

    if (divisionId) {
      setDivision(event.divisions?.find(d => String(d._id) === String(divisionId)));
    }
  };

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
        {event && event.eventUsers?.length > 0 && !division ? (
          <EventLoginForm
            event={event}
            onCancel={() => setEvent(undefined)}
            recaptchaRequired={recaptchaRequired}
          />
        ) : division && event && rooms && tables ? (
          <DivisionLoginForm
            recaptchaRequired={recaptchaRequired}
            event={event}
            division={division}
            rooms={rooms}
            tables={tables}
            onCancel={() => {
              setEvent(undefined);
              setDivision(undefined);
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
              includeDivisions
              getEventDisabled={event =>
                !!event.divisions && event.divisions.every(d => !d.hasState)
              }
              getDivisionDisabled={division => !division.hasState}
              onChange={selectDivision}
            />
          </Stack>
        )}
      </Paper>
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
      : { redirect: { destination: `/lems`, permanent: false } };
  } else {
    return apiFetch('/public/events', undefined, ctx)
      .then(response => response.json())
      .then((events: Array<WithId<FllEvent>>) => {
        return { props: { events, recaptchaRequired } };
      });
  }
};

export default Page;

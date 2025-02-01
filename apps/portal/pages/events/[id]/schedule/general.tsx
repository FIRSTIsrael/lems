import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next';
import dayjs from 'dayjs';
import { Typography, Container, Stack, Divider, Paper } from '@mui/material';
import { PortalActivity, PortalEvent } from '@lems/types';
import { fetchEvent, fetchGeneralSchedule } from '../../../../lib/api';
import StyledEventSubtitle from '../../../../components/events/styled-event-subtitle';

interface Props {
  event: PortalEvent;
  schedule: PortalActivity<'general'>[];
}

const Page: NextPage<Props> = ({ event, schedule }) => {
  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h2">לוח זמנים כללי</Typography>
      <StyledEventSubtitle event={event} />
      <Stack component={Paper} spacing={1} p={2} mt={2}>
        {schedule.length === 0 && <Typography variant="body1">אין לוח זמנים כללי</Typography>}
        {schedule.map((activity, index) => (
          <Stack
            key={index}
            spacing={2}
            direction="row"
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem sx={{ borderWidth: 1 }} />}
          >
            <Typography sx={{ dir: 'ltr' }} variant="body1" fontWeight={500}>
              {dayjs(activity.time).format('HH:mm')}
            </Typography>
            <Typography variant="body1">{activity.name}</Typography>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  const eventId = params?.id as string;

  const { event } = await fetchEvent(eventId);
  const schedule = await fetchGeneralSchedule(eventId);
  return {
    props: { event, schedule },
    revalidate: 10 * 60 // 10 minutes
  };
};

export default Page;

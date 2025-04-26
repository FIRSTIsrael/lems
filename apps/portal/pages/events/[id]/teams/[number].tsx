import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  PortalAward,
  PortalEvent,
  PortalTeam,
  PortalActivity,
  PortalScore,
  PortalEventStatus
} from '@lems/types';
import { fetchEvent, fetchTeam } from '../../../../lib/api';
import TeamSchedule from '../../../../components/teams/team-schedule';
import TeamInfo from '../../../../components/teams/team-info';
import TeamAwards from '../../../../components/teams/team-awards';
import TeamScores from '../../../../components/teams/team-scores';
import LoadingAnimation from '../../../../components/loading-animation';
import EventStatus from '../../../../components/events/event-status';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';

interface Props {
  team: PortalTeam;
  awards: PortalAward[] | null;
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ team, event, awards }) => {
  const {
    data: scores,
    isLoading: scoresLoading,
    error: scoresError
  } = useRealtimeData<PortalScore>(`/events/${event.id}/teams/${team.number}/scores`);

  const schedulePath = event.divisions
    ? `/events/${event.id}/teams/${team.number}/schedule`
    : `/events/${event.id}/schedule`;
  console.log('Schedule Endpoint:', schedulePath);

  const {
    data: schedule,
    isLoading: scheduleLoading,
    error: scheduleError
  } = useRealtimeData<PortalActivity<'match' | 'session' | 'general'>[]>(schedulePath);

  console.log('Schedule Data:', {
    path: schedulePath,
    data: schedule,
    loading: scheduleLoading,
    error: scheduleError
  });

  const {
    data: status,
    isLoading: statusLoading,
    error: statusError
  } = useRealtimeData<PortalEventStatus>(`/events/${event.id}/status`);

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid size={{ xs: 12, md: 6 }} display="flex" flexDirection="column">
          <TeamInfo team={team} event={event} />
          {awards && awards.length > 0 && <TeamAwards awards={awards} />}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {(scoresLoading || scoresError || statusLoading || statusError) && <LoadingAnimation />}
          {!scoresLoading && !scoresError && !statusLoading && !statusError && (
            <TeamScores score={scores} currentStage={status.field.stage} />
          )}
        </Grid>
        <Grid size={12}>
          {!statusLoading && !statusError && status.isLive && (
            <EventStatus event={event} status={status} />
          )}
          {(scheduleLoading || scheduleError) && <LoadingAnimation />}
          {!scheduleLoading && !scheduleError && schedule && <TeamSchedule schedule={schedule} />}
        </Grid>
      </Grid>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const teamNumber = ctx.params?.number as string;

  const { team, awards } = await fetchTeam(eventId, teamNumber);
  const { event } = await fetchEvent(eventId);
  return { props: { team, awards, event } };
};

export default Page;

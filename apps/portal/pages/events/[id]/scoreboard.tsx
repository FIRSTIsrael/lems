import { useRef, useEffect, useState } from 'react';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container, Typography, Box } from '@mui/material';
import { PortalScore, PortalEvent, PortalEventStatus } from '@lems/types';
import { fetchEvent } from '../../../lib/api';
import ScoreboardGrid from '../../../components/scoreboard-grid';
import { useRealtimeData } from '../../../hooks/use-realtime-data';
import LoadingAnimation from '../../../components/loading-animation';

interface Props {
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ event }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const {
    data: scoreboard,
    isLoading: scoresLoading,
    error: scoresError
  } = useRealtimeData<PortalScore[]>(`/events/${event.id}/scoreboard`);

  const {
    data: status,
    isLoading: statusLoading,
    error: statusError
  } = useRealtimeData<PortalEventStatus>(`/events/${event.id}/status`);

  console.log(scoresLoading, scoresError, statusLoading, statusError);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const topOffset = containerRef.current.getBoundingClientRect().top;
        setContainerHeight(window.innerHeight - topOffset);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: containerHeight ? `${containerHeight}px` : 'auto'
      }}
      ref={containerRef}
    >
      <Box sx={{ pb: 1 }}>
        <Typography variant="h1">לוח תוצאות</Typography>

        <Typography color="text.secondary" gutterBottom>
          {event.name}
          {!statusLoading &&
            !statusError &&
            ` - ${status.field.stage === 'practice' ? 'מקצי אימונים' : 'מקצי דירוג'}`}
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: 'auto',
          mb: 2
        }}
      >
        {(scoresLoading || scoresError) && <LoadingAnimation />}
        {!scoresLoading && !scoresError && <ScoreboardGrid data={scoreboard} />}
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event } = await fetchEvent(eventId);
  return { props: { event } };
};

export default Page;

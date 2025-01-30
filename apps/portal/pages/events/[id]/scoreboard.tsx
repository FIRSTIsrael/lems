import { useRef, useEffect, useState } from 'react';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container, Typography, Box } from '@mui/material';
import { PortalScore, PortalEvent, PortalEventStatus } from '@lems/types';
import { fetchEvent } from '../../../lib/api';
import ScoreboardGrid from '../../../components/scoreboard-grid';
import { useRealtimeData } from '../../../hooks/use-realtime-data';

interface Props {
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ event }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const { data: scoreboard, isLoading } = useRealtimeData<PortalScore[]>(
    `/events/${event.id}/scoreboard`
  );
  const { data: status, isLoading: statusLoading } = useRealtimeData<PortalEventStatus>(
    `/events/${event.id}/status`
  );

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

  // if (isLoading || statusLoading) return null;

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
        <Typography gutterBottom>
          {event.name} - {status.field.stage === 'practice' ? 'מקצי אימונים' : 'מקצי דירוג'}
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
        {isLoading && <Typography>טוען...</Typography>}
        {!isLoading && <ScoreboardGrid data={scoreboard} />}
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

import { useRef, useEffect, useState } from 'react';
import { NextPage, GetStaticProps, GetStaticPropsContext, GetStaticPaths } from 'next';
import { Container, Typography, Box, Stack } from '@mui/material';
import { PortalScore, PortalEvent, PortalEventStatus } from '@lems/types';
import { fetchEvent } from '../../../lib/api';
import { localizedMatchStage } from '../../../lib/localization';
import ScoreboardGrid from '../../../components/scoreboard-grid';
import { useRealtimeData } from '../../../hooks/use-realtime-data';
import LoadingAnimation from '../../../components/loading-animation';
import PageError from '../../../components/page-error';

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

        <Stack direction="row" spacing={2} alignItems="center">
          {event.isDivision && (
            <Box bgcolor={event.color} width={18} height={18} borderRadius={1} />
          )}
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {event.name}
            {event.isDivision && ` - ${event.subtitle}`}
            {!statusLoading && !statusError && `: מקצי ${localizedMatchStage[status.field.stage]}`}
          </Typography>
        </Stack>
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

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  const eventId = params?.id as string;
  const { event } = await fetchEvent(eventId);
  return {
    props: { event },
    revalidate: 10 * 60 // 10 minutes
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // We don't know the events at build time, Next.js will generate the pages at runtime.
  return { paths: [], fallback: 'blocking' };
}

export default Page;

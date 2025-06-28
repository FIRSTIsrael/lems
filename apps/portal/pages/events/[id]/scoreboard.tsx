import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container, Typography, Box, Stack } from '@mui/material';
import { PortalScore, PortalEvent, PortalEventStatus } from '@lems/types';
import { fetchEvent } from '../../../lib/api';
import { localizedMatchStage } from '../../../lib/localization';
import { getMessages } from '../../../locale/get-messages';
import { useRealtimeData } from '../../../hooks/use-realtime-data';
import ScoreboardGrid from '../../../components/scoreboard/scoreboard-grid';
import LoadingAnimation from '../../../components/loading-animation';

interface Props {
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ event }) => {
  const t = useTranslations('pages:events:[id]:scoreboard');

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
        <Typography variant="h1">{t('title')}</Typography>

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
        {!scoresLoading && !scoresError && <ScoreboardGrid data={scoreboard} eventId={event.id} />}
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event } = await fetchEvent(eventId);
  const messages = await getMessages(ctx.locale);
  return { props: { event, messages } };
};

export default Page;

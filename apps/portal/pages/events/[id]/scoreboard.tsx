import { useRef, useEffect, useState } from 'react';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container, Typography, Box } from '@mui/material';
import { PortalScore } from '@lems/types';
import { fetchScoreboard } from '../../../lib/api';
import ScoreboardGrid from 'apps/portal/components/scoreboard-grid';

interface Props {
  scoreboard: PortalScore[];
  currentStage: 'practice' | 'ranking';
}

const Page: NextPage<Props> = ({ scoreboard, currentStage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    if (containerRef.current) {
      const topOffset = containerRef.current.getBoundingClientRect().top;
      setContainerHeight(window.innerHeight - topOffset);
    }
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
        <Typography gutterBottom>
          {currentStage === 'practice' ? 'מקצי אימונים' : 'מקצי דירוג'}
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
        <ScoreboardGrid data={scoreboard} />
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { scoreboard, currentStage } = await fetchScoreboard(eventId);
  return { props: { scoreboard, currentStage } };
};

export default Page;

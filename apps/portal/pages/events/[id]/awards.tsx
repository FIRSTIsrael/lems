import { useRef, useEffect, useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { Container, Box, Typography, Stack } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  AwardNames,
  PortalAward,
  PortalEvent,
  CoreValuesAwardsTypes,
  CoreValuesAwards,
  PersonalAwardTypes,
  PersonalAwards
} from '@lems/types';
import { localizedAward } from '@lems/season';
import { fetchAwards, fetchEvent } from '../../../lib/api';
import { getColorByPlace } from '../../../lib/styling';

interface Props {
  awards: PortalAward[];
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ awards, event }) => {
  const awardsByName = awards.reduce(
    (acc, award) => {
      const copy = [...(acc[award.name] ?? []), award];
      acc[award.name] = copy.sort((a, b) => a.place - b.place);
      return acc;
    },
    {} as Record<AwardNames, PortalAward[]>
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

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

  const { advancement, ...restAwards } = awardsByName;

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        height: containerHeight ? `${containerHeight}px` : 'auto'
      }}
    >
      <Typography variant="h1">פרסים</Typography>
      <Typography gutterBottom>{event.name}</Typography>

      {Object.entries(restAwards).map(([awardName, awards]) => {
        if (awards.every(award => !award.winner)) return null; // Shouldn't happen but as a safeguard
        const showTrophys = ![...CoreValuesAwardsTypes, ...PersonalAwardTypes].includes(
          awardName as CoreValuesAwards | PersonalAwards
        );

        return (
          <Box key={awardName} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
            <Typography variant="h6">פרס {localizedAward[awardName as AwardNames].name}</Typography>
            {awards.map(award => (
              <Stack key={award.place} direction="row" spacing={1} mt={1}>
                {typeof award.winner === 'string' ? (
                  <Typography variant="body1">{award.winner}</Typography>
                ) : (
                  <>
                    {showTrophys && (
                      <EmojiEventsIcon sx={{ mr: 1, color: getColorByPlace(award.place) }} />
                    )}
                    <Typography>
                      {award.winner?.name} #{award.winner?.number}
                    </Typography>
                  </>
                )}
              </Stack>
            ))}
          </Box>
        );
      })}

      <Box sx={{ p: 2, mb: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
        <Typography variant="h6">מעפילות לתחרות האליפות</Typography>
        <Box sx={{ mt: 1 }}>
          {advancement.map((award, index) => {
            if (!award.winner || typeof award.winner === 'string') return null;
            return (
              <Typography key={index}>
                {award.winner.name} #{award.winner.number}
              </Typography>
            );
          })}
        </Box>
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  if (awards === null) return { redirect: { destination: `/events/${eventId}`, permanent: false } };

  return { props: { awards, event } };
};

export default Page;

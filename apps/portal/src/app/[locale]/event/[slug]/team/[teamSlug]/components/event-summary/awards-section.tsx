'use client';

import { useMemo } from 'react';
import { Typography, Grid } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { Award } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../../../hooks/use-realtime-data';
import { useTeamAtEvent } from '../team-at-event-context';

export const AwardsSection: React.FC = () => {
  const { event, team } = useTeamAtEvent();

  const { data: awards, isLoading } = useRealtimeData<Award[] | null>(
    `/portal/events/${event.slug}/teams/${team.slug}/awards`,
    { suspense: true, fallbackData: null }
  );

  const getAwardIcon = (award: { name: string; place: number }) => {
    switch (award.place) {
      case 1:
        return 'award.first';
      case 2:
        return 'award.second';
      case 3:
        return 'award.third';
      default:
        return 'award.other';
    }
  };

  const sortedAwards = useMemo(() => {
    if (!awards) return [];

    const advancement = awards.find(a => a.name === 'advancement');
    if (!advancement) return awards;

    const nonAdvancementAwards = awards.filter(a => a.name !== 'advancement');
    const championsIndex = nonAdvancementAwards.findIndex(a => a.name === 'champions');

    if (championsIndex !== -1) {
      nonAdvancementAwards.splice(championsIndex, 0, advancement);
    }

    return nonAdvancementAwards;
  }, [awards]);

  if (!awards || isLoading || awards.length === 0) {
    return null;
  }

  return (
    <>
      {sortedAwards.map((award, index) => {
        const trophyColor = getAwardIcon(award);
        return (
          <Grid
            size={{ xs: 12, sm: 6, lg: 3 }}
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <EmojiEvents sx={{ color: trophyColor, fontSize: '1.5rem' }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {award.name}
            </Typography>
          </Grid>
        );
      })}
    </>
  );
};

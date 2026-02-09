'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Paper, Box, Divider, Stack } from '@mui/material';
import { Award, Team } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../../hooks/use-realtime-data';
import { useDivision } from '../../division-data-context';
import { AwardRow } from './award-row';

export const AwardsTab: React.FC = () => {
  const t = useTranslations('pages.event');

  const division = useDivision();

  const { data: awards } = useRealtimeData<Award[]>(`/portal/divisions/${division.id}/awards`, {
    suspense: true
  });

  const { data: teams } = useRealtimeData<Team[]>(`/portal/divisions/${division.id}/teams`, {
    suspense: true
  });

  // Group awards by name, then sort by place
  const awardsByName = useMemo(() => {
    const result = (awards || []).reduce(
      (acc, award) => {
        if (!acc[award.name]) {
          acc[award.name] = [];
        }
        acc[award.name].push(award);
        return acc;
      },
      {} as Record<string, Award[]>
    );

    Object.keys(result).forEach(awardName => {
      result[awardName].sort((a, b) => a.place - b.place);
    });

    return result;
  }, [awards]);

  // Order awards so advancement comes right before champions
  const awardOrderedKeys = useMemo(() => {
    const keys = Object.keys(awardsByName);
    const advancement = 'advancement';
    const champions = 'champions';

    const advancementIdx = keys.indexOf(advancement);
    const championsIdx = keys.indexOf(champions);

    // If both exist, ensure advancement is right before champions
    if (advancementIdx !== -1 && championsIdx !== -1) {
      const filtered = keys.filter(k => k !== advancement);
      const newChampionsIdx = filtered.indexOf(champions);
      filtered.splice(newChampionsIdx, 0, advancement);
      return filtered;
    }

    return keys;
  }, [awardsByName]);

  if (awards === null) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h2" gutterBottom>
          {t('quick-links.awards')}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            {t('awards.no-data')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!awards) {
    return null; // Should be handled by suspense fallback
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.awards')}
      </Typography>

      <Stack spacing={3} divider={<Divider />}>
        {awardOrderedKeys.map(awardName => (
          <AwardRow
            key={awardName}
            awardName={awardName}
            awardList={awardsByName[awardName]}
            teams={teams}
          />
        ))}
      </Stack>
    </Paper>
  );
};
